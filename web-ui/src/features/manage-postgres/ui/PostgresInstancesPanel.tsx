import { useState } from "react";
import { DatabaseAdminSection, DatabaseInstancesSection } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type { useSettings } from "@/entities/settings";
import { SettingsConfigForm, type SettingsConfigField } from "@/features/manage-settings";
import type {
  AppText,
  CommandAction,
  PgAdminOverview,
  PostgresDatabaseForm,
  PostgresExportForm,
  PostgresImportForm,
  PostgresInstance,
  PostgresInstanceAction,
  PostgresInstanceForm,
  ShellAction,
} from "@/entities/infrastructure";
import { PostgresCreateModal } from "./PostgresCreateModal";
import { PostgresDatabaseBlock } from "./PostgresDatabaseBlock";
import { PostgresExportBlock } from "./PostgresExportBlock";
import { PostgresImportBlock } from "./PostgresImportBlock";

type PostgresInstancesPanelProps = {
  activeOperationKey?: null | string;
  databaseRefreshSignal?: number;
  defaultCreateForm?: Partial<PostgresInstanceForm>;
  defaultDatabase?: string;
  defaultDumpPath?: string;
  error: string | null;
  instances: PostgresInstance[];
  loading: boolean;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  text: AppText;
  onCreate: (form: PostgresInstanceForm) => void;
  onDatabaseCreate: (form: PostgresDatabaseForm) => void;
  onDatabaseDrop: (form: PostgresDatabaseForm) => void;
  onExport: (form: PostgresExportForm) => void;
  onImport: (form: PostgresImportForm) => void;
  onRun: (instance: PostgresInstance, action: PostgresInstanceAction) => void;
  onShellOpen: (instance: PostgresInstance) => void;
};

type PgAdminPanelProps = {
  activeOperationKey?: null | string;
  actions: CommandAction[];
  link?: ServiceLink;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  overview: PgAdminOverview;
  settingsState: ReturnType<typeof useSettings>;
  shell?: ShellAction;
  text: AppText;
  onRun: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

const pgAdminConfigFields: SettingsConfigField[] = [
  { autocomplete: "username", group: "pgadmin", label: "pgAdmin email", name: "pgaEmail" },
  {
    autocomplete: "current-password",
    group: "pgadmin",
    label: "pgAdmin password",
    name: "pgaPassword",
    type: "password",
  },
];

export function PostgresInstancesPanel({
  activeOperationKey,
  databaseRefreshSignal = 0,
  defaultCreateForm,
  defaultDatabase,
  defaultDumpPath,
  error,
  instances,
  loading,
  onCreate,
  onDatabaseCreate,
  onDatabaseDrop,
  onExport,
  onImport,
  onRun,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  text,
}: PostgresInstancesPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [postgresOpen, setPostgresOpen] = useState(false);
  const copy = text.postgresInstances;
  const actionLabels = text.mariadbInstances.actions;
  const runningInstances = instances.filter((instance) => instance.state === "running");

  return (
    <>
      <DatabaseInstancesSection
        actionLabels={{
          clean: actionLabels.clean.label,
          down: actionLabels.down.label,
          logs: actionLabels.logs.label,
          shell: actionLabels.shell.label,
          start: actionLabels.start.label,
          stop: actionLabels.stop.label,
          up: actionLabels.up.label,
        }}
        activeOperationKey={activeOperationKey}
        copy={copy}
        error={error}
        instances={instances}
        loading={loading}
        open={postgresOpen}
        operationDisabled={operationDisabled}
        operationDisabledTitle={operationDisabledTitle}
        operationKeyForAction={(instance, action) => `postgres:${instance.name}:${action}`}
        operationKeyForShell={(instance) => `shell:${instance.container}`}
        onCreateClick={() => setCreateOpen(true)}
        onOpenChange={setPostgresOpen}
        onRun={onRun}
        onShellOpen={onShellOpen}
      >
        <PostgresDatabaseBlock
          copy={copy.databaseManager}
          disabled={operationDisabled}
          disabledTitle={operationDisabledTitle}
          instances={runningInstances}
          loadingCreate={operationDisabled && activeOperationKey === "postgres:database:create"}
          loadingDrop={operationDisabled && activeOperationKey === "postgres:database:drop"}
          refreshSignal={databaseRefreshSignal}
          onCreate={onDatabaseCreate}
          onDrop={onDatabaseDrop}
        />
        <div className="grid gap-3 min-[1280px]:grid-cols-2">
          <PostgresImportBlock
            copy={copy.import}
            databaseRefreshSignal={databaseRefreshSignal}
            defaultDatabase={defaultDatabase}
            defaultFilePath={defaultDumpPath}
            disabled={operationDisabled}
            disabledTitle={operationDisabledTitle}
            instances={runningInstances}
            loading={operationDisabled && activeOperationKey === "postgres:import"}
            onImport={onImport}
          />
          <PostgresExportBlock
            copy={copy.export}
            databaseRefreshSignal={databaseRefreshSignal}
            defaultDatabase={defaultDatabase}
            defaultFilePath={defaultDumpPath}
            disabled={operationDisabled}
            disabledTitle={operationDisabledTitle}
            instances={runningInstances}
            loading={operationDisabled && activeOperationKey === "postgres:export"}
            onExport={onExport}
          />
        </div>
      </DatabaseInstancesSection>

      {createOpen ? (
        <PostgresCreateModal
          copy={copy}
          defaults={defaultCreateForm}
          onClose={() => setCreateOpen(false)}
          onCreate={onCreate}
        />
      ) : null}
    </>
  );
}

export function PgAdminPanel({
  actions,
  activeOperationKey,
  link,
  onRun,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  overview,
  settingsState,
  shell,
  text,
}: PgAdminPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = text.postgresInstances;
  const actionLabels = text.mariadbInstances.actions;

  return (
    <DatabaseAdminSection
      actions={actions}
      activeOperationKey={activeOperationKey}
      copy={{
        containerLabel: copy.containerLabel,
        linkLabel: text.common.link,
        shellLabel: actionLabels.shell.label,
        statusLabel: copy.statusLabel,
      }}
      link={link}
      open={open}
      operationDisabled={operationDisabled}
      operationDisabledTitle={operationDisabledTitle}
      overview={overview}
      shell={shell}
      title="pgAdmin"
      onOpenChange={setOpen}
      onRun={onRun}
      onShellOpen={onShellOpen}
    >
      <div className="border-t border-sky-100 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase text-slate-500">{copy.pgadminConfigTitle}</p>
        <SettingsConfigForm
          copy={text.settings}
          fields={pgAdminConfigFields}
          generateEnvAfterSave
          settingsState={settingsState}
        />
      </div>
    </DatabaseAdminSection>
  );
}
