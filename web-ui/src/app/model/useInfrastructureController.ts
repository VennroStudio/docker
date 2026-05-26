import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  commandPageRegistry,
  dictionaries,
  getViewById,
  getViewByPath,
  proxyShells,
  useAppMeta,
  useContainerStates,
  useServiceLinks,
  useServiceStatuses,
  type CommandAction,
  type CommandPageId,
  type MariaDbExportForm,
  type MariaDbImportForm,
  type MariaDbInstance,
  type MariaDbInstanceAction,
  type MariaDbInstanceForm,
  type PostgresInstance,
  type PostgresInstanceAction,
  type PostgresInstanceForm,
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
  streamMariaDbExport,
  streamMariaDbImport,
  streamMariaDbInstanceAction,
  streamMariaDbInstanceCreate,
  streamPostgresInstanceAction,
  streamPostgresInstanceCreate,
  streamProxy,
  streamProxyDelete,
  streamShell,
  useCommandStream,
} from "@/features/command-terminal";
import { useMariaDbInstances } from "@/features/manage-mariadb";
import { usePostgresInstances } from "@/features/manage-postgres";
import { useSettings } from "@/entities/settings";
import { useConfirmDialog } from "@/shared/lib/hooks";
import { useToast } from "@/shared/lib/hooks";
import { useLanguage } from "./useLanguage";

const initialProxyForm: ProxyFormState = {
  domain: "pma.local",
  port: "80",
  ssl: false,
  target: "phpmyadmin-container",
};

type OperationState = {
  key: string;
  label: string;
};

type RunWithTerminalConfig = {
  key: string;
  label: string;
  onSettled?: () => void;
  open: Parameters<ReturnType<typeof useCommandStream>["run"]>[1];
  preview: string;
};

export function useInfrastructureController() {
  const { language, toggleLanguage } = useLanguage();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [activeOperation, setActiveOperation] = useState<OperationState | null>(null);
  const activeOperationRef = useRef<OperationState | null>(null);
  const [proxyForm, setProxyForm] = useState(initialProxyForm);
  const commandStream = useCommandStream();
  const confirmDialog = useConfirmDialog();
  const toast = useToast();
  const appMeta = useAppMeta();
  const location = useLocation();
  const navigate = useNavigate();
  const activeConfig = getViewByPath(location.pathname);
  const activeView = activeConfig.id;
  const activeShells =
    activeView === "proxy"
      ? proxyShells
      : activeView === "mariadb"
        ? [...(commandPageRegistry.mariadb.shells || []), ...(commandPageRegistry.postgres.shells || [])]
        : commandPageRegistry[activeView as CommandPageId]?.shells || [];
  const containerStates = useContainerStates({
    enabled: activeView !== "home" && activeView !== "mariadb" && activeView !== "settings",
    names: activeShells.map((shell) => shell.container),
  });
  const serviceLinks = useServiceLinks();
  const serviceStatuses = useServiceStatuses({ enabled: activeView === "home" });
  const settings = useSettings();
  const mariaDbInstances = useMariaDbInstances(activeView === "mariadb");
  const postgresInstances = usePostgresInstances(activeView === "mariadb");
  const text = dictionaries[language];
  const operationRunning = commandStream.streamState === "running" && Boolean(activeOperation);
  const activeOperationKey = operationRunning ? activeOperation?.key : null;
  const operationBlockTitle =
    operationRunning && activeOperation ? text.operationToast.blocked(activeOperation.label) : undefined;

  const toggleTerminal = () => setTerminalOpen((value) => !value);
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

  const runWithTerminal = ({ key, label, onSettled, open, preview }: RunWithTerminalConfig) => {
    const lockedOperation = activeOperationRef.current;
    if (lockedOperation) {
      toast.show({ title: text.operationToast.blocked(lockedOperation.label), tone: "info" });
      return;
    }

    const nextOperation = { key, label };
    activeOperationRef.current = nextOperation;
    setActiveOperation(nextOperation);
    setTerminalOpen(true);

    try {
      commandStream.run(preview, open, {
        onSettled: ({ ok }) => {
          serviceStatuses.refresh();
          void containerStates.refresh();
          void serviceLinks.refresh();
          toast.show({
            title: ok ? text.operationToast.success(label) : text.operationToast.error(label),
            tone: ok ? "success" : "danger",
          });
          activeOperationRef.current = null;
          setActiveOperation(null);
          onSettled?.();
        },
      });
    } catch (error) {
      activeOperationRef.current = null;
      setActiveOperation(null);
      toast.show({
        message: error instanceof Error ? error.message : String(error),
        title: text.operationToast.error(label),
        tone: "danger",
      });
    }
  };

  const stopCommand = () => {
    const stoppedOperation = activeOperationRef.current ?? activeOperation;

    commandStream.stop();
    activeOperationRef.current = null;
    setActiveOperation(null);
    if (stoppedOperation) toast.show({ title: text.operationToast.stopped(stoppedOperation.label), tone: "info" });
  };

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
      open: (handlers) => streamCommand(action.id, handlers),
      preview: commandPreview(action.id),
    });
  };

  const runProxy = () => {
    runWithTerminal({
      key: "proxy:create",
      label: text.panels.proxy.createProxy,
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
      open: (handlers) => streamHost(action, proxyForm.domain, handlers),
      preview: hostPreview(action, proxyForm.domain),
    });
  };

  const runShell = (action: ShellAction) => {
    runWithTerminal({
      key: `shell:${action.container}`,
      label: action.label,
      open: (handlers) => streamShell(action.container, handlers),
      preview: `docker exec -i ${action.container} sh`,
    });
  };

  const runMariaDbInstanceCreate = (form: MariaDbInstanceForm) => {
    runWithTerminal({
      key: "mariadb:create",
      label: text.mariadbInstances.create,
      onSettled: mariaDbInstances.refresh,
      open: (handlers) => streamMariaDbInstanceCreate(form, handlers),
      preview: `node ./scripts/mariadb-instances.mjs add --version ${form.version}`,
    });
  };

  const runMariaDbImport = (form: MariaDbImportForm) => {
    runWithTerminal({
      key: "mariadb:import",
      label: text.mariadbInstances.import.action,
      onSettled: mariaDbInstances.refresh,
      open: (handlers) => streamMariaDbImport(form, handlers),
      preview: `make -e mariadb-import CONTAINER=${form.container} DB_NAME=${form.database} DUMP_FILE=${form.filePath}`,
    });
  };

  const runMariaDbExport = (form: MariaDbExportForm) => {
    runWithTerminal({
      key: "mariadb:export",
      label: text.mariadbInstances.export.action,
      onSettled: mariaDbInstances.refresh,
      open: (handlers) => streamMariaDbExport(form, handlers),
      preview: `make -e mariadb-export CONTAINER=${form.container} DB_NAME=${form.database} DUMP_FILE=${form.filePath}`,
    });
  };

  const runMariaDbInstanceAction = async (instance: MariaDbInstance, action: MariaDbInstanceAction) => {
    if (action === "clean" || action === "down" || action === "stop") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(`mariadb instance ${action}: ${instance.name}`),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: text.mariadbInstances.actions[action].label,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: `mariadb:${instance.name}:${action}`,
      label: text.mariadbInstances.actions[action].label,
      onSettled: mariaDbInstances.refresh,
      open: (handlers) => streamMariaDbInstanceAction(instance.name, action, handlers),
      preview: `docker compose -f ${instance.composeFile} ${action}`,
    });
  };

  const runMariaDbInstanceShell = (instance: MariaDbInstance) => {
    runWithTerminal({
      key: `shell:${instance.container}`,
      label: text.mariadbInstances.actions.shell.label,
      open: (handlers) => streamShell(instance.container, handlers),
      preview: `docker exec -i ${instance.container} sh`,
    });
  };

  const runPostgresInstanceCreate = (form: PostgresInstanceForm) => {
    runWithTerminal({
      key: "postgres:create",
      label: text.postgresInstances.create,
      onSettled: postgresInstances.refresh,
      open: (handlers) => streamPostgresInstanceCreate(form, handlers),
      preview: `node ./scripts/postgres-instances.mjs add --version ${form.version}`,
    });
  };

  const runPostgresInstanceAction = async (instance: PostgresInstance, action: PostgresInstanceAction) => {
    if (action === "clean" || action === "down" || action === "stop") {
      const confirmed = await confirmDialog.confirm({
        body: text.confirm.runCommand.body(`postgres instance ${action}: ${instance.name}`),
        cancelLabel: text.common.cancel,
        confirmLabel: text.confirm.runCommand.confirmLabel,
        title: text.mariadbInstances.actions[action].label,
        tone: "danger",
      });
      if (!confirmed) return;
    }

    runWithTerminal({
      key: `postgres:${instance.name}:${action}`,
      label: text.mariadbInstances.actions[action].label,
      onSettled: postgresInstances.refresh,
      open: (handlers) => streamPostgresInstanceAction(instance.name, action, handlers),
      preview: `docker compose -f ${instance.composeFile} ${action}`,
    });
  };

  const runPostgresInstanceShell = (instance: PostgresInstance) => {
    runWithTerminal({
      key: `shell:${instance.container}`,
      label: text.mariadbInstances.actions.shell.label,
      open: (handlers) => streamShell(instance.container, handlers),
      preview: `docker exec -i ${instance.container} sh`,
    });
  };

  const linkDetail = (container: string) => {
    const link = serviceLinks.links[container];
    return link ? { href: link.url, label: text.common.link, value: link.url } : undefined;
  };

  const moduleDetails = (container: string | undefined) => {
    const details: Array<{ href?: string; label: string; value?: string }> = [
      { label: text.mariadbInstances.containerLabel, value: container },
    ];
    const link = container ? linkDetail(container) : undefined;

    if (link) details.push(link);
    return details;
  };

  return {
    activeConfig,
    activeOperationKey,
    activeView,
    appMeta,
    commandStream,
    confirmDialog,
    containerStates,
    language,
    mariaDbInstances,
    moduleDetails,
    operationBlockTitle,
    operationRunning,
    postgresInstances,
    proxyForm,
    runCommand,
    runHost,
    runMariaDbExport,
    runMariaDbInstanceAction,
    runMariaDbInstanceCreate,
    runMariaDbImport,
    runMariaDbInstanceShell,
    runPostgresInstanceAction,
    runPostgresInstanceCreate,
    runPostgresInstanceShell,
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
