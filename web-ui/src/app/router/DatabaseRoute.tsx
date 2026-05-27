import { commandPageRegistry, pgadminActions, phpmyadminActions } from "@/entities/infrastructure";
import { MariaDbInstancesPanel, PhpMyAdminPanel } from "@/features/manage-mariadb";
import { PgAdminPanel, PostgresInstancesPanel } from "@/features/manage-postgres";
import { ServicePageLayout } from "@/widgets/service-page-layout";
import type { InfrastructureController } from "../model/useInfrastructureController";

type DatabaseRouteProps = {
  controller: InfrastructureController;
};

export function DatabaseRoute({ controller }: DatabaseRouteProps) {
  const {
    activeConfig,
    activeOperationKey,
    databaseRefreshSignal,
    mariaDbInstances,
    operationBlockTitle,
    operationRunning,
    postgresInstances,
    runCommand,
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
    runShell,
    serviceLinks,
    settings,
    text,
    translateActions,
    translateShells,
  } = controller;
  const page = text.servicePages.mariadb;
  const mariaShells = translateShells(commandPageRegistry.mariadb.shells || []);
  const postgresShells = translateShells(commandPageRegistry.postgres.shells || []);
  const mariaDbDefaults = settings.settings?.mariadb;
  const postgresDefaults = settings.settings?.postgres;
  const defaultDumpPath = mariaDbDefaults
    ? joinPath(mariaDbDefaults.homeDumpPath, mariaDbDefaults.dumpName)
    : undefined;
  const defaultPostgresDumpPath = postgresDefaults
    ? joinPath(postgresDefaults.homeDumpPath, postgresDefaults.dumpName)
    : undefined;
  const defaultMariaDbCreateForm = mariaDbDefaults
    ? {
        rootPassword: mariaDbDefaults.rootPassword,
        version: mariaDbDefaults.defaultVersion,
      }
    : undefined;
  const defaultPostgresCreateForm = postgresDefaults
    ? {
        database: postgresDefaults.database,
        password: postgresDefaults.password,
        user: postgresDefaults.user,
      }
    : undefined;

  return (
    <ServicePageLayout
      view={activeConfig}
      eyebrow={page.eyebrow}
      description={page.description}
      title={text.views.mariadb}
    >
      <div className="space-y-4">
        <MariaDbInstancesPanel
          activeOperationKey={activeOperationKey}
          databaseRefreshSignal={databaseRefreshSignal}
          defaultCreateForm={defaultMariaDbCreateForm}
          defaultDatabase={mariaDbDefaults?.defaultDatabase}
          defaultDumpPath={defaultDumpPath}
          error={mariaDbInstances.error}
          instances={mariaDbInstances.instances}
          loading={mariaDbInstances.loading}
          operationDisabled={operationRunning}
          operationDisabledTitle={operationBlockTitle}
          text={text}
          onCreate={runMariaDbInstanceCreate}
          onDatabaseCreate={runMariaDbDatabaseCreate}
          onDatabaseDrop={runMariaDbDatabaseDrop}
          onExport={runMariaDbExport}
          onImport={runMariaDbImport}
          onRun={runMariaDbInstanceAction}
          onShellOpen={runMariaDbInstanceShell}
        />
        <PostgresInstancesPanel
          activeOperationKey={activeOperationKey}
          databaseRefreshSignal={databaseRefreshSignal}
          defaultCreateForm={defaultPostgresCreateForm}
          defaultDatabase={postgresDefaults?.database}
          defaultDumpPath={defaultPostgresDumpPath}
          error={postgresInstances.error}
          instances={postgresInstances.instances}
          loading={postgresInstances.loading}
          operationDisabled={operationRunning}
          operationDisabledTitle={operationBlockTitle}
          text={text}
          onCreate={runPostgresInstanceCreate}
          onDatabaseCreate={runPostgresDatabaseCreate}
          onDatabaseDrop={runPostgresDatabaseDrop}
          onExport={runPostgresExport}
          onImport={runPostgresImport}
          onRun={runPostgresInstanceAction}
          onShellOpen={runPostgresInstanceShell}
        />
        <PhpMyAdminPanel
          actions={translateActions(phpmyadminActions)}
          activeOperationKey={activeOperationKey}
          link={serviceLinks.links["phpmyadmin-container"]}
          operationDisabled={operationRunning}
          operationDisabledTitle={operationBlockTitle}
          overview={mariaDbInstances.phpmyadmin}
          shell={mariaShells.find((shell) => shell.container === "phpmyadmin-container")}
          text={text}
          onRun={runCommand}
          onShellOpen={runShell}
        />
        <PgAdminPanel
          actions={translateActions(pgadminActions)}
          activeOperationKey={activeOperationKey}
          link={serviceLinks.links["pgadmin-container"]}
          operationDisabled={operationRunning}
          operationDisabledTitle={operationBlockTitle}
          overview={postgresInstances.pgadmin}
          shell={postgresShells.find((shell) => shell.container === "pgadmin-container")}
          text={text}
          onRun={runCommand}
          onShellOpen={runShell}
        />
      </div>
    </ServicePageLayout>
  );
}

function joinPath(base: string, name: string) {
  if (!base) return name;
  if (!name) return base;
  return `${base.replace(/\/+$/, "")}/${name.replace(/^\/+/, "")}`;
}
