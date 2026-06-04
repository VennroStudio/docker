import { useState } from "react";
import {
  DatabaseAdminSection,
  type AppText,
  type CommandAction,
  type PgAdminOverview,
  type ServiceLink,
  type ShellAction,
} from "@/entities/infrastructure";
import { SettingsConfigForm, type SettingsConfigField, type useSettings } from "@/entities/settings";

type PgAdminPanelProps = {
  activeOperationKey?: null | string;
  actions: CommandAction[];
  link?: ServiceLink;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  overview: PgAdminOverview;
  settingsState: ReturnType<typeof useSettings>;
  shell?: ShellAction;
  shellDisabled?: boolean;
  shellDisabledTitle?: string;
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
  shellDisabled,
  shellDisabledTitle,
  text,
}: PgAdminPanelProps) {
  const [open, setOpen] = useState(false);
  const copy = text.postgresInstances;
  const actionLabels = text.common.containerActions;

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
      shellDisabled={shellDisabled}
      shellDisabledTitle={shellDisabledTitle}
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
