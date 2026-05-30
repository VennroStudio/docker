import {
  applyContainerActionRules,
  pgadminActions,
  phpmyadminActions,
  shellDisabledForContainerState,
  type AppText,
  type CommandAction,
  type MariaDbDatabaseForm,
  type MariaDbExportForm,
  type MariaDbImportForm,
  type MariaDbInstance,
  type MariaDbInstanceAction,
  type MariaDbInstanceForm,
  type PgAdminOverview,
  type PhpMyAdminOverview,
  type PostgresDatabaseForm,
  type PostgresExportForm,
  type PostgresImportForm,
  type PostgresInstance,
  type PostgresInstanceAction,
  type PostgresInstanceForm,
  type ShellAction,
  type ViewConfig,
} from "@/entities/infrastructure";
import type { useSettings } from "@/entities/settings";
import { MariaDbInstancesPanel, PhpMyAdminPanel } from "@/features/manage-mariadb";
import { PgAdminPanel, PostgresInstancesPanel } from "@/features/manage-postgres";
import { ServicePageLayout } from "@/widgets/service-page-layout";

type DatabasesPageProps = {
  activeOperationKey?: null | string;
  databaseRefreshSignal?: number;
  mariaDb: {
    error: string | null;
    instances: MariaDbInstance[];
    loading: boolean;
    phpmyadmin: PhpMyAdminOverview;
  };
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  postgres: {
    error: string | null;
    instances: PostgresInstance[];
    loading: boolean;
    pgadmin: PgAdminOverview;
  };
  settingsState: ReturnType<typeof useSettings>;
  text: AppText;
  view: ViewConfig;
  translateActions: (actions: CommandAction[]) => CommandAction[];
  onCommandRun: (action: CommandAction) => void;
  onMariaDbCreate: (form: MariaDbInstanceForm) => void;
  onMariaDbDatabaseCreate: (form: MariaDbDatabaseForm) => void;
  onMariaDbDatabaseDrop: (form: MariaDbDatabaseForm) => void;
  onMariaDbExport: (form: MariaDbExportForm) => void;
  onMariaDbImport: (form: MariaDbImportForm) => void;
  onMariaDbRun: (instance: MariaDbInstance, action: MariaDbInstanceAction) => void;
  onMariaDbShellOpen: (instance: MariaDbInstance) => void;
  onPostgresCreate: (form: PostgresInstanceForm) => void;
  onPostgresDatabaseCreate: (form: PostgresDatabaseForm) => void;
  onPostgresDatabaseDrop: (form: PostgresDatabaseForm) => void;
  onPostgresExport: (form: PostgresExportForm) => void;
  onPostgresImport: (form: PostgresImportForm) => void;
  onPostgresRun: (instance: PostgresInstance, action: PostgresInstanceAction) => void;
  onPostgresShellOpen: (instance: PostgresInstance) => void;
  onShellOpen: (action: ShellAction) => void;
};

export function DatabasesPage({
  activeOperationKey,
  databaseRefreshSignal,
  mariaDb,
  onCommandRun,
  onMariaDbCreate,
  onMariaDbDatabaseCreate,
  onMariaDbDatabaseDrop,
  onMariaDbExport,
  onMariaDbImport,
  onMariaDbRun,
  onMariaDbShellOpen,
  onPostgresCreate,
  onPostgresDatabaseCreate,
  onPostgresDatabaseDrop,
  onPostgresExport,
  onPostgresImport,
  onPostgresRun,
  onPostgresShellOpen,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  postgres,
  settingsState,
  text,
  translateActions,
  view,
}: DatabasesPageProps) {
  const page = text.servicePages.mariadb;
  const mariaDbRunning = mariaDb.instances.some((instance) => instance.state === "running");
  const postgresRunning = postgres.instances.some((instance) => instance.state === "running");
  const pgAdminConfigReady = Boolean(
    settingsState.settings?.pgadmin?.pgaEmail?.trim() && settingsState.settings.pgadmin.pgaPassword?.trim(),
  );
  const phpMyAdminRuntimeActions = applyContainerActionRules(
    translateActions(phpmyadminActions),
    mariaDb.phpmyadmin.state,
    {
      disabledTitle: text.panels.serviceControl.containerRequired,
      upBlockedTitle: mariaDbRunning ? undefined : text.panels.serviceControl.mariadbRequired,
    },
  );
  const pgAdminUpBlockedTitle = blockedTitle([
    postgresRunning ? undefined : text.panels.serviceControl.postgresRequired,
    pgAdminConfigReady ? undefined : text.panels.serviceControl.pgadminCredentialsRequired,
  ]);
  const pgAdminRuntimeActions = applyContainerActionRules(translateActions(pgadminActions), postgres.pgadmin.state, {
    disabledTitle: text.panels.serviceControl.containerRequired,
    upBlockedTitle: pgAdminUpBlockedTitle,
  });

  return (
    <ServicePageLayout view={view} eyebrow={page.eyebrow} description={page.description} title={text.views.mariadb}>
      <div className="space-y-4">
        <MariaDbInstancesPanel
          activeOperationKey={activeOperationKey}
          databaseRefreshSignal={databaseRefreshSignal}
          error={mariaDb.error}
          instances={mariaDb.instances}
          loading={mariaDb.loading}
          operationDisabled={operationDisabled}
          operationDisabledTitle={operationDisabledTitle}
          text={text}
          onCreate={onMariaDbCreate}
          onDatabaseCreate={onMariaDbDatabaseCreate}
          onDatabaseDrop={onMariaDbDatabaseDrop}
          onExport={onMariaDbExport}
          onImport={onMariaDbImport}
          onRun={onMariaDbRun}
          onShellOpen={onMariaDbShellOpen}
        />
        <PostgresInstancesPanel
          activeOperationKey={activeOperationKey}
          databaseRefreshSignal={databaseRefreshSignal}
          error={postgres.error}
          instances={postgres.instances}
          loading={postgres.loading}
          operationDisabled={operationDisabled}
          operationDisabledTitle={operationDisabledTitle}
          text={text}
          onCreate={onPostgresCreate}
          onDatabaseCreate={onPostgresDatabaseCreate}
          onDatabaseDrop={onPostgresDatabaseDrop}
          onExport={onPostgresExport}
          onImport={onPostgresImport}
          onRun={onPostgresRun}
          onShellOpen={onPostgresShellOpen}
        />
        <PhpMyAdminPanel
          actions={phpMyAdminRuntimeActions}
          activeOperationKey={activeOperationKey}
          link={mariaDb.phpmyadmin.state === "running" ? serviceLink(mariaDb.phpmyadmin.url, "phpMyAdmin") : undefined}
          operationDisabled={operationDisabled}
          operationDisabledTitle={operationDisabledTitle}
          overview={mariaDb.phpmyadmin}
          shell={shellAction(mariaDb.phpmyadmin.container, "phpMyAdmin", text)}
          shellDisabled={shellDisabledForContainerState(mariaDb.phpmyadmin.state)}
          shellDisabledTitle={text.panels.serviceControl.containerRequired}
          text={text}
          onRun={onCommandRun}
          onShellOpen={onShellOpen}
        />
        <PgAdminPanel
          actions={pgAdminRuntimeActions}
          activeOperationKey={activeOperationKey}
          link={postgres.pgadmin.state === "running" ? serviceLink(postgres.pgadmin.url, "pgAdmin") : undefined}
          operationDisabled={operationDisabled}
          operationDisabledTitle={operationDisabledTitle}
          overview={postgres.pgadmin}
          settingsState={settingsState}
          shell={shellAction(postgres.pgadmin.container, "pgAdmin", text)}
          shellDisabled={shellDisabledForContainerState(postgres.pgadmin.state)}
          shellDisabledTitle={text.panels.serviceControl.containerRequired}
          text={text}
          onRun={onCommandRun}
          onShellOpen={onShellOpen}
        />
      </div>
    </ServicePageLayout>
  );
}

function blockedTitle(messages: Array<string | undefined>) {
  const activeMessages = messages.filter(Boolean);
  return activeMessages.length > 0 ? activeMessages.join(" ") : undefined;
}

function shellAction(container: string, label: string, text: AppText): ShellAction | undefined {
  if (!container) return undefined;
  return {
    container,
    detail: text.shell.detail(container),
    label: text.shell.openLabel(label),
  };
}

function serviceLink(url: string | undefined, label: string) {
  return url ? { label, source: "settings" as const, url } : undefined;
}
