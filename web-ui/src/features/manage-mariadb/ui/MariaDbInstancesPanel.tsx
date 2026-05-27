import { useState } from "react";
import { DatabaseAdminSection, DatabaseInstancesSection } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type {
  AppText,
  MariaDbDatabaseForm,
  MariaDbExportForm,
  MariaDbImportForm,
  CommandAction,
  MariaDbInstance,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  PhpMyAdminOverview,
  ShellAction,
} from "@/entities/infrastructure";
import { MariaDbCreateModal } from "./MariaDbCreateModal";
import { MariaDbDatabaseBlock } from "./MariaDbDatabaseBlock";
import { MariaDbExportBlock } from "./MariaDbExportBlock";
import { MariaDbImportBlock } from "./MariaDbImportBlock";

type MariaDbInstancesPanelProps = {
  activeOperationKey?: null | string;
  databaseRefreshSignal?: number;
  defaultCreateForm?: Partial<MariaDbInstanceForm>;
  defaultDatabase?: string;
  defaultDumpPath?: string;
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

type PhpMyAdminPanelProps = {
  activeOperationKey?: null | string;
  actions: CommandAction[];
  link?: ServiceLink;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  overview: PhpMyAdminOverview;
  shell?: ShellAction;
  text: AppText;
  onRun: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

export function MariaDbInstancesPanel({
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
            defaultDatabase={defaultDatabase}
            defaultFilePath={defaultDumpPath}
            disabled={operationDisabled}
            disabledTitle={operationDisabledTitle}
            instances={runningInstances}
            loading={operationDisabled && activeOperationKey === "mariadb:import"}
            onImport={onImport}
          />
          <MariaDbExportBlock
            copy={copy.export}
            databaseRefreshSignal={databaseRefreshSignal}
            defaultDatabase={defaultDatabase}
            defaultFilePath={defaultDumpPath}
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

export function PhpMyAdminPanel({
  actions,
  activeOperationKey,
  link,
  onRun,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  overview,
  shell,
  text,
}: PhpMyAdminPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = text.mariadbInstances;

  return (
    <DatabaseAdminSection
      actions={actions}
      activeOperationKey={activeOperationKey}
      copy={{
        containerLabel: copy.containerLabel,
        domainLabel: copy.domainLabel,
        domainUnknown: copy.domainUnknown,
        linkLabel: text.common.link,
        shellLabel: copy.actions.shell.label,
        statusLabel: copy.statusLabel,
      }}
      eyebrow={copy.phpmyadminEyebrow}
      link={link}
      open={open}
      operationDisabled={operationDisabled}
      operationDisabledTitle={operationDisabledTitle}
      overview={overview}
      shell={shell}
      title="phpMyAdmin"
      onOpenChange={setOpen}
      onRun={onRun}
      onShellOpen={onShellOpen}
    />
  );
}
