import { commandPageRegistry, pgadminActions, phpmyadminActions } from "@/entities/infrastructure";
import { MariaDbInstancesPanel } from "@/features/manage-mariadb";
import { PostgresInstancesPanel } from "@/features/manage-postgres";
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
      <div className="grid gap-4 min-[1500px]:grid-cols-2">
        <MariaDbInstancesPanel
          activeOperationKey={activeOperationKey}
          error={mariaDbInstances.error}
          instances={mariaDbInstances.instances}
          loading={mariaDbInstances.loading}
          operationDisabled={operationRunning}
          operationDisabledTitle={operationBlockTitle}
          phpmyadmin={mariaDbInstances.phpmyadmin}
          phpmyadminActions={translateActions(phpmyadminActions)}
          phpmyadminLink={serviceLinks.links["phpmyadmin-container"]}
          phpmyadminShell={mariaShells.find((shell) => shell.container === "phpmyadmin-container")}
          text={text}
          onCreate={runMariaDbInstanceCreate}
          onPhpMyAdminRun={runCommand}
          onPhpMyAdminShellOpen={runShell}
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
          pgadmin={postgresInstances.pgadmin}
          pgadminActions={translateActions(pgadminActions)}
          pgadminLink={serviceLinks.links["pgadmin-container"]}
          pgadminShell={postgresShells.find((shell) => shell.container === "pgadmin-container")}
          text={text}
          onCreate={runPostgresInstanceCreate}
          onPgAdminRun={runCommand}
          onPgAdminShellOpen={runShell}
          onRun={runPostgresInstanceAction}
          onShellOpen={runPostgresInstanceShell}
        />
      </div>
    </ServicePageLayout>
  );
}
