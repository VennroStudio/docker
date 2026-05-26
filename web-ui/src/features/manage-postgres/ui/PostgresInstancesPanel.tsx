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
  error: string | null;
  instances: PostgresInstance[];
  loading: boolean;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  pgadmin: PgAdminOverview;
  pgadminActions: CommandAction[];
  pgadminLink?: ServiceLink;
  pgadminShell?: ShellAction;
  text: AppText;
  onCreate: (form: PostgresInstanceForm) => void;
  onPgAdminRun: (action: CommandAction) => void;
  onPgAdminShellOpen: (action: ShellAction) => void;
  onRun: (instance: PostgresInstance, action: PostgresInstanceAction) => void;
  onShellOpen: (instance: PostgresInstance) => void;
};

export function PostgresInstancesPanel({
  activeOperationKey,
  error,
  instances,
  loading,
  onCreate,
  onPgAdminRun,
  onPgAdminShellOpen,
  onRun,
  onShellOpen,
  operationDisabled,
  operationDisabledTitle,
  pgadmin,
  pgadminActions,
  pgadminLink,
  pgadminShell,
  text,
}: PostgresInstancesPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [pgAdminOpen, setPgAdminOpen] = useState(false);
  const [postgresOpen, setPostgresOpen] = useState(true);
  const copy = text.postgresInstances;
  const actionLabels = text.mariadbInstances.actions;

  return (
    <div className="space-y-4">
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

      {createOpen ? <PostgresCreateModal copy={copy} onClose={() => setCreateOpen(false)} onCreate={onCreate} /> : null}

      <DatabaseAdminSection
        actions={pgadminActions}
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
        link={pgadminLink}
        open={pgAdminOpen}
        operationDisabled={operationDisabled}
        operationDisabledTitle={operationDisabledTitle}
        overview={pgadmin}
        shell={pgadminShell}
        title="pgAdmin"
        onOpenChange={setPgAdminOpen}
        onRun={onPgAdminRun}
        onShellOpen={onPgAdminShellOpen}
      />
    </div>
  );
}
