import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { AccordionPanel, IconLink } from "@/shared/ui";
import { DatabaseAction, InfoLine, ShellIconButton, StatusDot } from "../DatabaseControls";
import { commandActionsBySuffix, databaseActionOrder } from "./types";
import type { DatabaseAdminSectionProps } from "./types";

export function DatabaseAdminSection({
  activeOperationKey,
  actions,
  children,
  copy,
  eyebrow,
  link,
  onOpenChange,
  onRun,
  onShellOpen,
  open,
  operationDisabled = false,
  operationDisabledTitle,
  overview,
  shell,
  title,
}: DatabaseAdminSectionProps) {
  const actionsBySuffix = useMemo(() => commandActionsBySuffix(actions), [actions]);
  const shellOperationKey = shell ? `shell:${shell.container}` : undefined;
  const actionTitle = (label: string, operationKey: string | undefined) =>
    operationDisabled && activeOperationKey !== operationKey ? operationDisabledTitle : label;

  return (
    <AccordionPanel
      eyebrow={eyebrow}
      open={open}
      title={title}
      titlePrefix={<StatusDot state={overview.state} />}
      actions={
        <>
          {link ? (
            <IconLink href={link.url} label={link.label} title={link.url}>
              <ExternalLink size={16} strokeWidth={2.5} />
            </IconLink>
          ) : null}
          {databaseActionOrder.map((action) => {
            const commandAction = actionsBySuffix[action];
            return commandAction ? (
              <DatabaseAction
                key={action}
                action={action}
                disabled={operationDisabled}
                label={commandAction.label}
                loading={operationDisabled && activeOperationKey === commandAction.id}
                title={actionTitle(commandAction.label, commandAction.id)}
                onClick={() => onRun(commandAction)}
              />
            ) : null;
          })}
          {shell ? (
            <ShellIconButton
              disabled={operationDisabled}
              label={copy.shellLabel}
              loading={operationDisabled && activeOperationKey === shellOperationKey}
              title={actionTitle(copy.shellLabel, shellOperationKey)}
              onClick={() => onShellOpen(shell)}
            />
          ) : null}
        </>
      }
      onOpenChange={onOpenChange}
    >
      <div className="grid gap-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoLine label={copy.containerLabel} value={overview.container} />
          {link ? <InfoLine href={link.url} label={copy.linkLabel} value={link.url} /> : null}
          {overview.status ? <InfoLine label={copy.statusLabel} value={overview.status} /> : null}
        </div>
        {children}
      </div>
    </AccordionPanel>
  );
}
