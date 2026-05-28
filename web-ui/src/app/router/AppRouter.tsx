import { nginxActions, proxyShells } from "@/entities/infrastructure";
import { DatabasesPage } from "@/pages/databases";
import { HomePage } from "@/pages/home";
import { ProxyPage } from "@/pages/proxy";
import { getServiceModulesPageModel, ServiceModulesPage } from "@/pages/service-modules";
import { SettingsPage } from "@/pages/settings";
import type { InfrastructureController } from "../model/useInfrastructureController";

type AppRouterProps = {
  controller: InfrastructureController;
};

export function AppRouter({ controller }: AppRouterProps) {
  const {
    activeConfig,
    activeOperationKey,
    activeView,
    containerStates,
    databaseRefreshSignal,
    mariaDbInstances,
    operationBlockTitle,
    operationRunning,
    postgresInstances,
    proxyForm,
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
    serviceLinks,
    serviceStatuses,
    settings,
    setProxyForm,
    text,
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
        statusByContainer={containerStates.states}
        serviceLinks={serviceLinks.links}
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
        serviceLinks={serviceLinks.links}
        settings={settings.settings}
        text={text}
        translateActions={translateActions}
        translateShells={translateShells}
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

  const serviceModulesPage = getServiceModulesPageModel({
    activeView,
    containerStates: containerStates.states,
    serviceLinks: serviceLinks.links,
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
      view={activeConfig}
      onRun={runCommand}
      onShellOpen={runShell}
    />
  );
}
