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
    mariaDbInstances,
    operationBlockTitle,
    operationRunning,
    postgresInstances,
    runCommand,
    runMariaDbExport,
    runMariaDbImport,
    runMariaDbInstanceAction,
    runMariaDbInstanceCreate,
    runMariaDbInstanceShell,
    runPostgresInstanceAction,
    runPostgresInstanceCreate,
    runPostgresInstanceShell,
    runShell,
    serviceLinks,
    text,
    translateActions,
    translateShells,
  } = controller;
  const page = text.servicePages.mariadb;
  const mariaShells = translateShells(commandPageRegistry.mariadb.shells || []);
  const postgresShells = translateShells(commandPageRegistry.postgres.shells || []);

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
          error={mariaDbInstances.error}
          instances={mariaDbInstances.instances}
          loading={mariaDbInstances.loading}
          operationDisabled={operationRunning}
          operationDisabledTitle={operationBlockTitle}
          text={text}
          onCreate={runMariaDbInstanceCreate}
          onExport={runMariaDbExport}
          onImport={runMariaDbImport}
          onRun={runMariaDbInstanceAction}
          onShellOpen={runMariaDbInstanceShell}
        />
        <PostgresInstancesPanel
          activeOperationKey={activeOperationKey}
          error={postgresInstances.error}
          instances={postgresInstances.instances}
          loading={postgresInstances.loading}
          operationDisabled={operationRunning}
          operationDisabledTitle={operationBlockTitle}
          text={text}
          onCreate={runPostgresInstanceCreate}
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
