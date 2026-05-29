import { useState } from "react";
import { DatabaseInstancesSection } from "@/entities/infrastructure";
import type {
  AppText,
  MariaDbDatabaseForm,
  MariaDbExportForm,
  MariaDbImportForm,
  MariaDbInstance,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
} from "@/entities/infrastructure";
import { MariaDbCreateModal } from "./MariaDbCreateModal";
import { MariaDbDatabaseBlock } from "./MariaDbDatabaseBlock";
import { MariaDbExportBlock } from "./MariaDbExportBlock";
import { MariaDbImportBlock } from "./MariaDbImportBlock";

type MariaDbInstancesPanelProps = {
  activeOperationKey?: null | string;
  databaseRefreshSignal?: number;
  defaultCreateForm?: Partial<MariaDbInstanceForm>;
  error: string | null;
  instances: MariaDbInstance[];
  loading: boolean;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  text: AppText;
  onCreate: (form: MariaDbInstanceForm) => void;
  onDatabaseCreate: (form: MariaDbDatabaseForm) => void;
  onDatabaseDrop: (form: MariaDbDatabaseForm) => void;
  onExport: (form: MariaDbExportForm) => void;
  onImport: (form: MariaDbImportForm) => void;
  onRun: (instance: MariaDbInstance, action: MariaDbInstanceAction) => void;
  onShellOpen: (instance: MariaDbInstance) => void;
};

export function MariaDbInstancesPanel({
  activeOperationKey,
  databaseRefreshSignal = 0,
  defaultCreateForm,
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
}: MariaDbInstancesPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [mariadbOpen, setMariaDbOpen] = useState(false);
  const copy = text.mariadbInstances;
  const runningInstances = instances.filter((instance) => instance.state === "running");

  return (
    <>
      <DatabaseInstancesSection
        actionLabels={{
          clean: copy.actions.clean.label,
          down: copy.actions.down.label,
          logs: copy.actions.logs.label,
          shell: copy.actions.shell.label,
          start: copy.actions.start.label,
          stop: copy.actions.stop.label,
          up: copy.actions.up.label,
        }}
        activeOperationKey={activeOperationKey}
        copy={copy}
        error={error}
        instances={instances}
        loading={loading}
        open={mariadbOpen}
        operationDisabled={operationDisabled}
        operationDisabledTitle={operationDisabledTitle}
        operationKeyForAction={(instance, action) => `mariadb:${instance.name}:${action}`}
        operationKeyForShell={(instance) => `shell:${instance.container}`}
        onCreateClick={() => setCreateOpen(true)}
        onOpenChange={setMariaDbOpen}
        onRun={onRun}
        onShellOpen={onShellOpen}
      >
        <MariaDbDatabaseBlock
          copy={copy.databaseManager}
          disabled={operationDisabled}
          disabledTitle={operationDisabledTitle}
          instances={runningInstances}
          loadingCreate={operationDisabled && activeOperationKey === "mariadb:database:create"}
          loadingDrop={operationDisabled && activeOperationKey === "mariadb:database:drop"}
          refreshSignal={databaseRefreshSignal}
          onCreate={onDatabaseCreate}
          onDrop={onDatabaseDrop}
        />
        <div className="grid gap-3 min-[1280px]:grid-cols-2">
          <MariaDbImportBlock
            copy={copy.import}
            databaseRefreshSignal={databaseRefreshSignal}
            disabled={operationDisabled}
            disabledTitle={operationDisabledTitle}
            instances={runningInstances}
            loading={operationDisabled && activeOperationKey === "mariadb:import"}
            onImport={onImport}
          />
          <MariaDbExportBlock
            copy={copy.export}
            databaseRefreshSignal={databaseRefreshSignal}
            disabled={operationDisabled}
            disabledTitle={operationDisabledTitle}
            instances={runningInstances}
            loading={operationDisabled && activeOperationKey === "mariadb:export"}
            onExport={onExport}
          />
        </div>
      </DatabaseInstancesSection>

      {createOpen ? (
        <MariaDbCreateModal
          copy={copy}
          defaults={defaultCreateForm}
          onClose={() => setCreateOpen(false)}
          onCreate={onCreate}
        />
      ) : null}
    </>
  );
}
