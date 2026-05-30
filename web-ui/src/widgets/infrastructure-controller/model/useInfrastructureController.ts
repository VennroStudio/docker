import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
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
  useSshServers,
  type CommandAction,
  type ProxyFormState,
  type ShellAction,
  type SshServer,
  type ViewId,
} from "@/entities/infrastructure";
import { openShellTerminal } from "@/features/command-terminal";
import type { SshTerminalAction } from "@/features/ssh-terminal";
import { useMariaDbInstances } from "@/features/manage-mariadb";
import { usePostgresInstances } from "@/features/manage-postgres";
import { useSettings } from "@/entities/settings";
import { useConfirmDialog } from "@/shared/lib/hooks";
import { useToast } from "@/shared/lib/hooks";
import { shellPreview } from "./shellPreview";
import { useArchiveOperations } from "./useArchiveOperations";
import { useCommandOperations } from "./useCommandOperations";
import { useDatabaseOperations } from "./useDatabaseOperations";
import { useLanguage } from "./useLanguage";
import { useProxyOperations } from "./useProxyOperations";
import { useSshOperations } from "./useSshOperations";
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
  const [sshTerminalSession, setSshTerminalSession] = useState<{
    action: SshTerminalAction;
    input?: {
      data: string;
      id: number;
    };
    server: SshServer;
  } | null>(null);
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
  const sshView = activeView === "ssh";
  const nginxStatus = useNginxStatus(activeView === "proxy");
  const redisStatus = useRedisStatus(redisView);
  const minioStatus = useMinioStatus(minioView);
  const registryStatus = useRegistryStatus(registryView);
  const sshServers = useSshServers(sshView);
  const serviceStatuses = useServiceStatuses({ enabled: activeView === "home" });
  const statusRefresh = redisView
    ? redisStatus.refresh
    : minioView
      ? minioStatus.refresh
      : registryView
        ? registryStatus.refresh
        : sshView
          ? sshServers.refresh
          : nginxStatus.refresh;
  const settings = useSettings();
  const archives = useArchives(utilitiesView, archivesRefreshSignal);
  const mariaDbInstances = useMariaDbInstances(activeView === "mariadb");
  const postgresInstances = usePostgresInstances(activeView === "mariadb");
  const text = dictionaries[language];
  const {
    activeOperationKey,
    operationBlockTitle,
    operationRunning,
    runWithTerminal,
    showTerminal,
    stopCommand,
    terminalSession,
    terminalOpen,
    toggleTerminal,
  } = useTerminalOperations({
    onBeforeRun: () => setSshTerminalSession(null),
    statusRefresh,
    serviceStatusesRefresh: serviceStatuses.refresh,
    text,
    toast,
  });

  const refreshDatabaseCatalog = () => setDatabaseRefreshSignal((value) => value + 1);
  const refreshArchives = () => setArchivesRefreshSignal((value) => value + 1);
  const commandOperations = useCommandOperations({
    confirmDialog,
    refreshNginxStatus: nginxStatus.refresh,
    runWithTerminal,
    text,
    toast,
  });
  const proxyOperations = useProxyOperations({
    confirmDialog,
    proxyForm,
    refreshNginxStatus: nginxStatus.refresh,
    runWithTerminal,
    text,
  });
  const archiveOperations = useArchiveOperations({
    confirmDialog,
    refreshArchives,
    runWithTerminal,
    text,
  });
  const databaseOperations = useDatabaseOperations({
    confirmDialog,
    refreshDatabaseCatalog,
    refreshMariaDbInstances: mariaDbInstances.refresh,
    refreshPostgresInstances: postgresInstances.refresh,
    runWithTerminal,
    text,
  });
  const sshOperations = useSshOperations({
    confirmDialog,
    insertSshCommand: (server, command) => {
      const data = command.trim();
      if (!data) return;

      if (
        !sshTerminalSession ||
        sshTerminalSession.action !== "connect" ||
        sshTerminalSession.server.id !== server.id
      ) {
        toast.show({ title: text.ssh.messages.connectFirst, tone: "info" });
        showTerminal();
        return;
      }

      setSshTerminalSession({
        ...sshTerminalSession,
        input: { data, id: Date.now() },
      });
      showTerminal();
      toast.show({ title: text.ssh.messages.commandInserted, tone: "success" });
    },
    openSshTerminal: (server, action) => {
      if (operationRunning) {
        toast.show({ title: operationBlockTitle || text.operationToast.blocked(server.name), tone: "info" });
        return;
      }

      setSshTerminalSession({ action, server });
      showTerminal();
    },
    refreshSshServers: sshServers.refresh,
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
  const refreshSshAfterTerminalExit = () => {
    if (sshView) void sshServers.refresh();
  };

  const runShell = (action: ShellAction) => {
    runWithTerminal({
      key: `shell:${action.container}`,
      label: action.label,
      open: (handlers) => openShellTerminal(action.container, handlers),
      preview: shellPreview(action.container),
    });
  };

  return {
    activeConfig,
    activeOperationKey,
    activeView,
    appMeta,
    archives,
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
    sshServers,
    sshTerminalSession,
    ...archiveOperations,
    ...commandOperations,
    ...databaseOperations,
    ...proxyOperations,
    ...sshOperations,
    runShell,
    selectView,
    serviceStatuses,
    settings,
    setProxyForm,
    refreshSshAfterTerminalExit,
    stopCommand,
    terminalSession,
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
