import { useState } from "react";
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
import { useConfirmDialog } from "@/shared/lib/hooks";
import { useLanguage } from "./useLanguage";

const initialProxyForm: ProxyFormState = {
  domain: "pma.local",
  port: "80",
  ssl: false,
  target: "phpmyadmin-container",
};

export function useInfrastructureController() {
  const { language, toggleLanguage } = useLanguage();
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [proxyForm, setProxyForm] = useState(initialProxyForm);
  const commandStream = useCommandStream();
  const confirmDialog = useConfirmDialog();
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
    enabled: activeView !== "home" && activeView !== "mariadb",
    names: activeShells.map((shell) => shell.container),
  });
  const serviceLinks = useServiceLinks();
  const serviceStatuses = useServiceStatuses({ enabled: activeView === "home" });
  const mariaDbInstances = useMariaDbInstances(activeView === "mariadb");
  const postgresInstances = usePostgresInstances(activeView === "mariadb");
  const text = dictionaries[language];

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

  const runWithTerminal = (preview: string, open: Parameters<typeof commandStream.run>[1], onSettled?: () => void) => {
    setTerminalOpen(true);
    commandStream.run(preview, open, {
      onSettled: () => {
        serviceStatuses.refresh();
        void containerStates.refresh();
        void serviceLinks.refresh();
        onSettled?.();
      },
    });
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

    runWithTerminal(commandPreview(action.id), (handlers) => streamCommand(action.id, handlers));
  };

  const runProxy = () => {
    runWithTerminal(proxyPreview(proxyForm), (handlers) => streamProxy(proxyForm, handlers));
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

    runWithTerminal(proxyDeletePreview(proxyForm.domain), (handlers) => streamProxyDelete(proxyForm.domain, handlers));
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

    runWithTerminal(hostPreview(action, proxyForm.domain), (handlers) =>
      streamHost(action, proxyForm.domain, handlers),
    );
  };

  const runShell = (action: ShellAction) => {
    runWithTerminal(`docker exec -i ${action.container} sh`, (handlers) => streamShell(action.container, handlers));
  };

  const runMariaDbInstanceCreate = (form: MariaDbInstanceForm) => {
    runWithTerminal(
      `node ./scripts/mariadb-instances.mjs add --version ${form.version}`,
      (handlers) => streamMariaDbInstanceCreate(form, handlers),
      mariaDbInstances.refresh,
    );
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

    runWithTerminal(
      `docker compose -f ${instance.composeFile} ${action}`,
      (handlers) => streamMariaDbInstanceAction(instance.name, action, handlers),
      mariaDbInstances.refresh,
    );
  };

  const runMariaDbInstanceShell = (instance: MariaDbInstance) => {
    runWithTerminal(`docker exec -i ${instance.container} sh`, (handlers) => streamShell(instance.container, handlers));
  };

  const runPostgresInstanceCreate = (form: PostgresInstanceForm) => {
    runWithTerminal(
      `node ./scripts/postgres-instances.mjs add --version ${form.version}`,
      (handlers) => streamPostgresInstanceCreate(form, handlers),
      postgresInstances.refresh,
    );
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

    runWithTerminal(
      `docker compose -f ${instance.composeFile} ${action}`,
      (handlers) => streamPostgresInstanceAction(instance.name, action, handlers),
      postgresInstances.refresh,
    );
  };

  const runPostgresInstanceShell = (instance: PostgresInstance) => {
    runWithTerminal(`docker exec -i ${instance.container} sh`, (handlers) => streamShell(instance.container, handlers));
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
    activeView,
    appMeta,
    commandStream,
    confirmDialog,
    containerStates,
    language,
    mariaDbInstances,
    moduleDetails,
    postgresInstances,
    proxyForm,
    runCommand,
    runHost,
    runMariaDbInstanceAction,
    runMariaDbInstanceCreate,
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
    setProxyForm,
    terminalOpen,
    text,
    toggleLanguage,
    toggleTerminal,
    translateActions,
    translateShells,
  };
}

export type InfrastructureController = ReturnType<typeof useInfrastructureController>;
