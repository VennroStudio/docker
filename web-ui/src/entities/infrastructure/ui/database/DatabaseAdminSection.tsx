import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { AccordionPanel, IconLink } from "@/shared/ui";
import { ContainerStateBadge } from "../ContainerStateBadge";
import { DatabaseAction, InfoLine, ShellIconButton, StatusDot } from "../DatabaseControls";
import { commandActionsBySuffix, databaseActionOrder } from "../../model/database/types";
import type { DatabaseAdminSectionProps } from "../../model/database/types";

export function DatabaseAdminSection({
  activeOperationKey,
  actions,
  children,
  copy,
  link,
  onOpenChange,
  onRun,
  onShellOpen,
  open,
  operationDisabled = false,
  operationDisabledTitle,
  overview,
  shell,
  shellDisabled = false,
  shellDisabledTitle,
  title,
}: DatabaseAdminSectionProps) {
  const actionsBySuffix = useMemo(() => commandActionsBySuffix(actions), [actions]);
  const shellOperationKey = shell ? `shell:${shell.container}` : undefined;
  const actionTitle = (
    label: string,
    operationKey: string | undefined,
    blockedTitle?: string,
    disabledTitle?: string,
  ) =>
    operationDisabled && activeOperationKey !== operationKey
      ? operationDisabledTitle
      : blockedTitle || disabledTitle || label;

  return (
    <AccordionPanel
      eyebrow={<ContainerStateBadge state={overview.state} />}
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
                disabled={operationDisabled || commandAction.disabled}
                label={commandAction.label}
                loading={operationDisabled && activeOperationKey === commandAction.id}
                title={actionTitle(
                  commandAction.label,
                  commandAction.id,
                  commandAction.blockedTitle,
                  commandAction.disabledTitle,
                )}
                onClick={() => onRun(commandAction)}
              />
            ) : null;
          })}
          {shell ? (
            <ShellIconButton
              disabled={operationDisabled || shellDisabled}
              label={copy.shellLabel}
              loading={operationDisabled && activeOperationKey === shellOperationKey}
              title={
                operationDisabled && activeOperationKey !== shellOperationKey
                  ? operationDisabledTitle
                  : shellDisabled
                    ? shellDisabledTitle
                    : copy.shellLabel
              }
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
