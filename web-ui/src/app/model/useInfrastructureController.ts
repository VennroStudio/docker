import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  commandPageRegistry,
  dictionaries,
  getViewById,
  getViewByPath,
  useAppMeta,
  useArchives,
  useMinioStatus,
  useNginxStatus,
  useRedisStatus,
  useRegistryStatus,
  useServiceStatuses,
  type CommandAction,
  type ArchiveCreateForm,
  type ArchiveExtractForm,
  type ProxyFormState,
  type ShellAction,
  type ViewId,
} from "@/entities/infrastructure";
import {
  commandPreview,
  archiveCreatePreview,
  archiveDeletePreview,
  archiveExtractPreview,
  hostPreview,
  proxyDeletePreview,
  proxyPreview,
  streamCommand,
  streamArchiveCreate,
  streamArchiveDelete,
  streamArchiveExtract,
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
  domain: "",
  port: "",
  ssl: false,
  target: "",
};

export function useInfrastructureController() {
  const { language, toggleLanguage } = useLanguage();
  const [archivesRefreshSignal, setArchivesRefreshSignal] = useState(0);
  const [databaseRefreshSignal, setDatabaseRefreshSignal] = useState(0);
  const [proxyForm, setProxyForm] = useState(initialProxyForm);
  const confirmDialog = useConfirmDialog();
  const toast = useToast();
  const appMeta = useAppMeta();
  const location = useLocation();
  const navigate = useNavigate();
  const activeConfig = getViewByPath(location.pathname);
  const activeView = activeConfig.id;
  const redisView = activeView === "redis";
  const minioView = activeView === "minio";
  const registryView = activeView === "registry";
  const utilitiesView = activeView === "utilities";
  const nginxStatus = useNginxStatus(activeView === "proxy");
  const redisStatus = useRedisStatus(redisView);
  const minioStatus = useMinioStatus(minioView);
  const registryStatus = useRegistryStatus(registryView);
  const serviceStatuses = useServiceStatuses({ enabled: activeView === "home" });
  const statusRefresh = redisView
    ? redisStatus.refresh
    : minioView
      ? minioStatus.refresh
      : registryView
        ? registryStatus.refresh
        : nginxStatus.refresh;
  const settings = useSettings();
  const archives = useArchives(utilitiesView, archivesRefreshSignal);
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
    statusRefresh,
    serviceStatusesRefresh: serviceStatuses.refresh,
    text,
    toast,
  });

  const refreshDatabaseCatalog = () => setDatabaseRefreshSignal((value) => value + 1);
  const refreshArchives = () => setArchivesRefreshSignal((value) => value + 1);
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

  const runArchiveCreate = (form: ArchiveCreateForm) => {
    runWithTerminal({
      key: "archive:create",
      label: text.utilities.archive.createAction,
      onSettled: refreshArchives,
      open: (handlers) => streamArchiveCreate(form, handlers),
      preview: archiveCreatePreview(form),
    });
  };

  const runArchiveExtract = (form: ArchiveExtractForm) => {
    runWithTerminal({
      key: "archive:extract",
      label: text.utilities.archive.extractAction,
      open: (handlers) => streamArchiveExtract(form, handlers),
      preview: archiveExtractPreview(form),
    });
  };

  const runArchiveDelete = async (name: string) => {
    const confirmed = await confirmDialog.confirm({
      body: text.confirm.runCommand.body(archiveDeletePreview(name)),
      cancelLabel: text.common.cancel,
      confirmLabel: text.confirm.runCommand.confirmLabel,
      title: text.utilities.archive.deleteTitle,
      tone: "danger",
    });
    if (!confirmed) return;

    runWithTerminal({
      key: "archive:delete",
      label: text.utilities.archive.deleteAction,
      onSettled: refreshArchives,
      open: (handlers) => streamArchiveDelete(name, handlers),
      preview: archiveDeletePreview(name),
    });
  };

  return {
    activeConfig,
    activeOperationKey,
    activeView,
    appMeta,
    archives,
    commandStream,
    confirmDialog,
    databaseRefreshSignal,
    language,
    mariaDbInstances,
    minioStatus,
    nginxStatus,
    operationBlockTitle,
    operationRunning,
    postgresInstances,
    proxyForm,
    redisStatus,
    registryStatus,
    runArchiveCreate,
    runArchiveDelete,
    runArchiveExtract,
    runCommand,
    runHost,
    ...databaseOperations,
    runProxy,
    runProxyDelete,
    runShell,
    selectView,
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
  if (container === "nginx-container") return "make npm-shell";
  if (container === "phpmyadmin-container") return "make phpmyadmin-shell";
  if (container === "pgadmin-container") return "make pgadmin-shell";
  if (container === "redis-container") return "make redis-shell";
  if (container === "redisinsight-container") return "make redisinsight-shell";
  if (container === "minio-container") return "make minio-shell";
  if (container === "registry-container") return "make registry-shell";
  if (container === "registry-ui-container") return "make registry-ui-shell";
  if (container.startsWith("mariadb-")) return `make mariadb-instance-shell CONTAINER=${container}`;
  if (container.startsWith("postgres-")) return `make postgres-instance-shell CONTAINER=${container}`;
  return `make compose-shell CONTAINER=${container}`;
}
