import { useState } from "react";
import { DatabaseAdminSection, DatabaseInstancesSection } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type {
  AppText,
  CommandAction,
  PgAdminOverview,
  PostgresInstance,
  PostgresInstanceAction,
  PostgresInstanceForm,
  ShellAction,
} from "@/entities/infrastructure";
import { PostgresCreateModal } from "./PostgresCreateModal";

type PostgresInstancesPanelProps = {
  activeOperationKey?: null | string;
  defaultCreateForm?: Partial<PostgresInstanceForm>;
  error: string | null;
  instances: PostgresInstance[];
  loading: boolean;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  text: AppText;
  onCreate: (form: PostgresInstanceForm) => void;
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
  shell?: ShellAction;
  text: AppText;
  onRun: (action: CommandAction) => void;
  onShellOpen: (action: ShellAction) => void;
};

export function PostgresInstancesPanel({
  activeOperationKey,
  defaultCreateForm,
  error,
  instances,
  loading,
  onCreate,
  onRun,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  text,
}: PostgresInstancesPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [postgresOpen, setPostgresOpen] = useState(true);
  const copy = text.postgresInstances;
  const actionLabels = text.mariadbInstances.actions;

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
      />

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
        domainLabel: copy.domainLabel,
        domainUnknown: copy.domainUnknown,
        linkLabel: text.common.link,
        shellLabel: actionLabels.shell.label,
        statusLabel: copy.statusLabel,
      }}
      eyebrow={copy.pgadminEyebrow}
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
    />
  );
}
