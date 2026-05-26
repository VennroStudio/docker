import { useState } from "react";
import { DatabaseAdminSection, DatabaseInstancesSection } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type {
  AppText,
  CommandAction,
  MariaDbInstance,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  PhpMyAdminOverview,
  ShellAction,
} from "@/entities/infrastructure";
import { MariaDbCreateModal } from "./MariaDbCreateModal";

type MariaDbInstancesPanelProps = {
  error: string | null;
  instances: MariaDbInstance[];
  loading: boolean;
  phpmyadmin: PhpMyAdminOverview;
  phpmyadminActions: CommandAction[];
  phpmyadminLink?: ServiceLink;
  phpmyadminShell?: ShellAction;
  text: AppText;
  onCreate: (form: MariaDbInstanceForm) => void;
  onPhpMyAdminRun: (action: CommandAction) => void;
  onPhpMyAdminShellOpen: (action: ShellAction) => void;
  onRun: (instance: MariaDbInstance, action: MariaDbInstanceAction) => void;
  onShellOpen: (instance: MariaDbInstance) => void;
};

export function MariaDbInstancesPanel({
  error,
  instances,
  loading,
  onCreate,
  onPhpMyAdminRun,
  onPhpMyAdminShellOpen,
  onRun,
  onShellOpen,
  phpmyadmin,
  phpmyadminActions,
  phpmyadminLink,
  phpmyadminShell,
  text,
}: MariaDbInstancesPanelProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [mariadbOpen, setMariaDbOpen] = useState(true);
  const [phpMyAdminOpen, setPhpMyAdminOpen] = useState(false);
  const copy = text.mariadbInstances;

  return (
    <div className="space-y-4">
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
        copy={copy}
        error={error}
        instances={instances}
        loading={loading}
        open={mariadbOpen}
        onCreateClick={() => setCreateOpen(true)}
        onOpenChange={setMariaDbOpen}
        onRun={onRun}
        onShellOpen={onShellOpen}
      />

      {createOpen ? <MariaDbCreateModal copy={copy} onClose={() => setCreateOpen(false)} onCreate={onCreate} /> : null}

      <DatabaseAdminSection
        actions={phpmyadminActions}
        copy={{
          containerLabel: copy.containerLabel,
          domainLabel: copy.domainLabel,
          domainUnknown: copy.domainUnknown,
          linkLabel: text.common.link,
          shellLabel: copy.actions.shell.label,
          statusLabel: copy.statusLabel,
        }}
        eyebrow={copy.phpmyadminEyebrow}
        link={phpmyadminLink}
        open={phpMyAdminOpen}
        overview={phpmyadmin}
        shell={phpmyadminShell}
        title="phpMyAdmin"
        onOpenChange={setPhpMyAdminOpen}
        onRun={onPhpMyAdminRun}
        onShellOpen={onPhpMyAdminShellOpen}
      />
    </div>
  );
}
