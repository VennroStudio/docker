import { nginxActions, proxyShells } from "@/entities/infrastructure";
import { DatabasesPage } from "@/pages/databases";
import { HomePage } from "@/pages/home";
import { ProxyPage } from "@/pages/proxy";
import { getServiceModulesPageModel, ServiceModulesPage } from "@/pages/service-modules";
import { SettingsPage } from "@/pages/settings";
import { SshPage } from "@/pages/ssh";
import { UtilitiesPage } from "@/pages/utilities";
import type { InfrastructureController } from "@/widgets/infrastructure-controller";

type AppRouterProps = {
  controller: InfrastructureController;
};

export function AppRouter({ controller }: AppRouterProps) {
  const {
    activeConfig,
    activeOperationKey,
    activeView,
    archives,
    databaseRefreshSignal,
    mariaDbInstances,
    minioStatus,
    nginxStatus,
    operationBlockTitle,
    operationRunning,
    postgresInstances,
    proxyForm,
    redisStatus,
    registryStatus,
    runSshConnect,
    runSshCommandAdd,
    runSshCommandInsert,
    runSshCommandRemove,
    runSshCommandUpdate,
    runSshKeyGenerate,
    runSshKeyRemove,
    runSshKeyPush,
    runSshServerAdd,
    runSshServerRemove,
    runSshServerUpdate,
    runArchiveCreate,
    runArchiveDelete,
    runArchiveExtract,
    runCommand,
    runHost,
    runMariaDbDatabaseCreate,
    runMariaDbDatabaseDrop,
    runMariaDbExport,
    runMariaDbImport,
    runMariaDbInstanceAction,
    runMariaDbInstanceCreate,
    runMariaDbInstanceShell,
    runPostgresDatabaseCreate,
    runPostgresDatabaseDrop,
    runPostgresExport,
    runPostgresImport,
    runPostgresInstanceAction,
    runPostgresInstanceCreate,
    runPostgresInstanceShell,
    runProxy,
    runProxyDelete,
    runShell,
    selectView,
    serviceStatuses,
    settings,
    setProxyForm,
    sshServers,
    text,
    toast,
    translateActions,
    translateShells,
  } = controller;

  if (activeView === "home") {
    return <HomePage statuses={serviceStatuses.statuses} text={text} onOpenView={selectView} />;
  }

  if (activeView === "proxy") {
    return (
      <ProxyPage
        nginxActions={translateActions(nginxActions)}
        activeOperationKey={activeOperationKey}
        operationDisabled={operationRunning}
        operationDisabledTitle={operationBlockTitle}
        shellActions={translateShells(proxyShells)}
        nginxStatus={nginxStatus}
        settingsState={settings}
        text={text}
        value={proxyForm}
        view={activeConfig}
        onChange={setProxyForm}
        onCreateProxy={runProxy}
        onHostAdd={() => runHost("add")}
        onHostRemove={() => runHost("remove")}
        onProxyDelete={runProxyDelete}
        onRunCommand={runCommand}
        onShellOpen={runShell}
      />
    );
  }

  if (activeView === "mariadb") {
    return (
      <DatabasesPage
        activeOperationKey={activeOperationKey}
        databaseRefreshSignal={databaseRefreshSignal}
        mariaDb={mariaDbInstances}
        operationDisabled={operationRunning}
        operationDisabledTitle={operationBlockTitle}
        postgres={postgresInstances}
        settingsState={settings}
        text={text}
        translateActions={translateActions}
        view={activeConfig}
        onCommandRun={runCommand}
        onMariaDbCreate={runMariaDbInstanceCreate}
        onMariaDbDatabaseCreate={runMariaDbDatabaseCreate}
        onMariaDbDatabaseDrop={runMariaDbDatabaseDrop}
        onMariaDbExport={runMariaDbExport}
        onMariaDbImport={runMariaDbImport}
        onMariaDbRun={runMariaDbInstanceAction}
        onMariaDbShellOpen={runMariaDbInstanceShell}
        onPostgresCreate={runPostgresInstanceCreate}
        onPostgresDatabaseCreate={runPostgresDatabaseCreate}
        onPostgresDatabaseDrop={runPostgresDatabaseDrop}
        onPostgresExport={runPostgresExport}
        onPostgresImport={runPostgresImport}
        onPostgresRun={runPostgresInstanceAction}
        onPostgresShellOpen={runPostgresInstanceShell}
        onShellOpen={runShell}
      />
    );
  }

  if (activeView === "settings") {
    return <SettingsPage settingsState={settings} text={text} view={activeConfig} />;
  }

  if (activeView === "utilities") {
    return (
      <UtilitiesPage
        activeOperationKey={activeOperationKey}
        archivesState={archives}
        operationDisabled={operationRunning}
        operationDisabledTitle={operationBlockTitle}
        text={text}
        view={activeConfig}
        onArchiveCreate={runArchiveCreate}
        onArchiveDelete={runArchiveDelete}
        onArchiveExtract={runArchiveExtract}
      />
    );
  }

  if (activeView === "ssh") {
    return (
      <SshPage
        sshServers={sshServers}
        text={text}
        view={activeConfig}
        onCopyPassword={(password) => {
          void navigator.clipboard.writeText(password);
          toast.show({ title: text.ssh.actions.copyPassword, tone: "success" });
        }}
        onCommandAdd={runSshCommandAdd}
        onCommandInsert={runSshCommandInsert}
        onCommandRemove={runSshCommandRemove}
        onCommandUpdate={runSshCommandUpdate}
        onKeyGenerate={runSshKeyGenerate}
        onKeyRemove={runSshKeyRemove}
        onKeyPush={runSshKeyPush}
        onServerAdd={runSshServerAdd}
        onServerDelete={runSshServerRemove}
        onServerSave={runSshServerUpdate}
        onTerminalOpen={runSshConnect}
      />
    );
  }

  const serviceModulesPage = getServiceModulesPageModel({
    activeView,
    minioStatus: minioStatus.status,
    redisStatus: redisStatus.status,
    registryStatus: registryStatus.status,
    text,
    translateActions,
    translateShells,
  });
  if (!serviceModulesPage) return null;

  return (
    <ServiceModulesPage
      activeOperationKey={activeOperationKey}
      description={serviceModulesPage.description}
      eyebrow={serviceModulesPage.eyebrow}
      modules={serviceModulesPage.modules}
      operationDisabled={operationRunning}
      operationDisabledTitle={operationBlockTitle}
      settingsState={settings}
      text={text}
      view={activeConfig}
      onRun={runCommand}
      onShellOpen={runShell}
    />
  );
}
