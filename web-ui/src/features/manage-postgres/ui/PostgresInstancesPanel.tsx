import { useState } from "react";
import { DatabaseInstancesSection } from "@/entities/infrastructure";
import type {
  AppText,
  PostgresDatabaseForm,
  PostgresExportForm,
  PostgresImportForm,
  PostgresInstance,
  PostgresInstanceAction,
  PostgresInstanceForm,
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
