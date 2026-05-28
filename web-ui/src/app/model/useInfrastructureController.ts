import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  commandPageRegistry,
  dictionaries,
  getViewById,
  getViewByPath,
  useAppMeta,
  useContainerStates,
  useNginxStatus,
  useServiceLinks,
  useServiceStatuses,
  type CommandAction,
  type CommandPageId,
  type ProxyFormState,
  type ShellAction,
  type ViewId,
} from "@/entities/infrastructure";
import {
  commandPreview,
  hostPreview,
  proxyDeletePreview,
  proxyPreview,
  streamCommand,
  streamHost,
  streamProxy,
  streamProxyDelete,
  streamShell,
} from "@/features/command-terminal";
import { useMariaDbInstances } from "@/features/manage-mariadb";
import { usePostgresInstances } from "@/features/manage-postgres";
import { useSettings } from "@/entities/settings";
import { useConfirmDialog } from "@/shared/lib/hooks";
import { useToast } from "@/shared/lib/hooks";
import { useDatabaseOperations } from "./useDatabaseOperations";
import { useLanguage } from "./useLanguage";
import { useTerminalOperations } from "./useTerminalOperations";

const initialProxyForm: ProxyFormState = {
  domain: "pma.local",
  port: "80",
  ssl: false,
  target: "phpmyadmin-container",
};

export function useInfrastructureController() {
  const { language, toggleLanguage } = useLanguage();
  const [databaseRefreshSignal, setDatabaseRefreshSignal] = useState(0);
  const [proxyForm, setProxyForm] = useState(initialProxyForm);
  const confirmDialog = useConfirmDialog();
  const toast = useToast();
  const appMeta = useAppMeta();
  const location = useLocation();
  const navigate = useNavigate();
  const activeConfig = getViewByPath(location.pathname);
  const activeView = activeConfig.id;
  const activeShells =
    activeView === "mariadb"
        ? [...(commandPageRegistry.mariadb.shells || []), ...(commandPageRegistry.postgres.shells || [])]
        : commandPageRegistry[activeView as CommandPageId]?.shells || [];
  const containerStates = useContainerStates({
    enabled: activeView !== "home" && activeView !== "mariadb" && activeView !== "settings" && activeView !== "proxy",
    names: activeShells.map((shell) => shell.container),
  });
  const serviceLinks = useServiceLinks(activeView !== "proxy");
  const nginxStatus = useNginxStatus(activeView === "proxy");
  const serviceStatuses = useServiceStatuses({ enabled: activeView === "home" });
  const settings = useSettings();
  const mariaDbInstances = useMariaDbInstances(activeView === "mariadb");
  const postgresInstances = usePostgresInstances(activeView === "mariadb");
  const text = dictionaries[language];
  const {
    activeOperationKey,
    commandStream,
    operationBlockTitle,
    operationRunning,
    runWithTerminal,
    stopCommand,
    terminalOpen,
    toggleTerminal,
  } = useTerminalOperations({
    containerStatesRefresh: containerStates.refresh,
    serviceLinksRefresh: serviceLinks.refresh,
    serviceStatusesRefresh: serviceStatuses.refresh,
    text,
    toast,
  });

  const refreshDatabaseCatalog = () => setDatabaseRefreshSignal((value) => value + 1);
  const databaseOperations = useDatabaseOperations({
    confirmDialog,
    refreshDatabaseCatalog,
    refreshMariaDbInstances: mariaDbInstances.refresh,
    refreshPostgresInstances: postgresInstances.refresh,
    runWithTerminal,
    text,
  });
  const selectView = (view: ViewId) => navigate(getViewById(view).path);
  const translateActions = (actions: CommandAction[]) =>
    actions.map((action) => ({
      ...action,
      ...text.actions[action.id],
    }));
  const translateShells = (actions: ShellAction[]) =>
    actions.map((action) => ({
      ...action,
      detail: text.shell.detail(action.container),
      label: text.shell.openLabel(action.label),
    }));

  const runCommand = async (action: CommandAction) => {
    if (action.confirm) {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(commandPreview(action.id)),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: action.label,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: action.id,
      label: action.label,
      onSettled: action.id.startsWith("npm:") ? nginxStatus.refresh : undefined,
      open: (handlers) => streamCommand(action.id, handlers),
      preview: commandPreview(action.id),
    });
  };

  const runProxy = () => {
    runWithTerminal({
      key: "proxy:create",
      label: text.panels.proxy.createProxy,
      onSettled: nginxStatus.refresh,
      open: (handlers) => streamProxy(proxyForm, handlers),
      preview: proxyPreview(proxyForm),
    });
  };

  const runProxyDelete = async () => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.deleteProxy.body(proxyForm.domain),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.deleteProxy.confirmLabel,
      title: text.confirm.deleteProxy.title,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: "proxy:delete",
      label: text.panels.proxy.deleteProxy,
      onSettled: nginxStatus.refresh,
      open: (handlers) => streamProxyDelete(proxyForm.domain, handlers),
      preview: proxyDeletePreview(proxyForm.domain),
    });
  };

  const runHost = async (action: "add" | "remove") => {
    if (action === "remove") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.deleteHost.body(proxyForm.domain),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.deleteHost.confirmLabel,
        title: text.confirm.deleteHost.title,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: `host:${action}`,
      label: action === "add" ? text.panels.proxy.addHost : text.panels.proxy.removeHost,
      onSettled: nginxStatus.refresh,
      open: (handlers) => streamHost(action, proxyForm.domain, handlers),
      preview: hostPreview(action, proxyForm.domain),
    });
  };

  const runShell = (action: ShellAction) => {
    runWithTerminal({
      key: `shell:${action.container}`,
      label: action.label,
      open: (handlers) => streamShell(action.container, handlers),
      preview: shellPreview(action.container),
    });
  };

  return {
    activeConfig,
    activeOperationKey,
    activeView,
    appMeta,
    commandStream,
    confirmDialog,
    containerStates,
    databaseRefreshSignal,
    language,
    mariaDbInstances,
    nginxStatus,
    operationBlockTitle,
    operationRunning,
    postgresInstances,
    proxyForm,
    runCommand,
    runHost,
    ...databaseOperations,
    runProxy,
    runProxyDelete,
    runShell,
    selectView,
    serviceLinks,
    serviceStatuses,
    settings,
    setProxyForm,
    stopCommand,
    terminalOpen,
    text,
    toggleLanguage,
    toggleTerminal,
    translateActions,
    translateShells,
    toast,
  };
}

export type InfrastructureController = ReturnType<typeof useInfrastructureController>;

function shellPreview(container: string) {
  return container === "nginx-container" ? "make npm-shell" : `docker exec -i ${container} sh`;
}
