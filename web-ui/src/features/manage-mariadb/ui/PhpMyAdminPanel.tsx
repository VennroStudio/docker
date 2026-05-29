import { useState } from "react";
import {
  DatabaseAdminSection,
  type AppText,
  type CommandAction,
  type PhpMyAdminOverview,
  type ServiceLink,
  type ShellAction,
} from "@/entities/infrastructure";

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
        linkLabel: text.common.link,
        shellLabel: copy.actions.shell.label,
        statusLabel: copy.statusLabel,
      }}
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
