import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ContainerStateBadge, InfoLine, StatusDot } from "@/entities/infrastructure";
import type { ContainerStateInfo } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type { CommandAction, ShellAction } from "@/entities/infrastructure";
import { AccordionPanel, IconLink } from "@/shared/ui";
import { moduleActionTone, orderModuleActions } from "../model/moduleActions";
import { ModuleActionButton } from "./ModuleActionButton";
import { moduleActionIcon } from "./moduleActionIcon";

type ServiceModuleAccordionProps = {
  activeOperationKey?: null | string;
  actions: CommandAction[];
  children?: ReactNode;
  defaultOpen?: boolean;
  details?: Array<{ href?: string; label: string; value?: string }>;
  eyebrow: string;
  link?: ServiceLink;
  operationDisabled?: boolean;
  operationDisabledTitle?: string;
  shell?: ShellAction;
  shellDisabled?: boolean;
  shellDisabledTitle?: string;
  status?: ContainerStateInfo;
  stateEyebrow?: boolean;
  statusLabel?: string;
  title: string;
  onRun: (action: CommandAction) => void;
  onShellOpen?: (action: ShellAction) => void;
};

export function ServiceModuleAccordion({
  activeOperationKey = null,
  actions,
  children,
  defaultOpen = false,
  details = [],
  eyebrow,
  link,
  onRun,
  onShellOpen,
  operationDisabled = false,
  operationDisabledTitle,
  shell,
  shellDisabled = false,
  shellDisabledTitle,
  status,
  stateEyebrow = false,
  statusLabel = "Status",
  title,
}: ServiceModuleAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const orderedActions = useMemo(() => orderModuleActions(actions), [actions]);
  const visibleDetails = details.filter((detail) => detail.value);
  const shellOperationKey = shell ? `shell:${shell.container}` : undefined;

  return (
    <AccordionPanel
      contentClassName="px-4 py-4"
      defaultTitleElement="span"
      eyebrow={stateEyebrow ? <ContainerStateBadge state={status?.state || "unknown"} /> : eyebrow}
      open={open}
      title={title}
      titlePrefix={status ? <StatusDot state={status.state} /> : undefined}
      actions={
        <>
          {link ? (
            <IconLink href={link.url} label={link.label} title={link.url}>
              <ExternalLink size={16} strokeWidth={2.5} />
            </IconLink>
          ) : null}
          {orderedActions.map(({ action, suffix }) => (
            <ModuleActionButton
              key={action.id}
              disabled={operationDisabled || action.disabled}
              label={action.label}
              loading={operationDisabled && activeOperationKey === action.id}
              tone={moduleActionTone[suffix]}
              title={
                operationDisabled && activeOperationKey !== action.id
                  ? operationDisabledTitle
                  : action.blockedTitle
                    ? action.blockedTitle
                    : action.disabled
                      ? action.disabledTitle
                      : action.label
              }
              onClick={() => onRun(action)}
            >
              {moduleActionIcon[suffix]}
            </ModuleActionButton>
          ))}
          {shell ? (
            <ModuleActionButton
              disabled={operationDisabled || shellDisabled}
              label={shell.label}
              loading={operationDisabled && activeOperationKey === shellOperationKey}
              tone={moduleActionTone.shell}
              title={
                operationDisabled && activeOperationKey !== shellOperationKey
                  ? operationDisabledTitle
                  : shellDisabled
                    ? shellDisabledTitle
                    : shell.label
              }
              onClick={() => onShellOpen?.(shell)}
            >
              {moduleActionIcon.shell}
            </ModuleActionButton>
          ) : null}
        </>
      }
      onOpenChange={setOpen}
    >
      <div className="grid gap-4">
        {visibleDetails.length > 0 || status?.status || status?.error ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleDetails.map((detail) => (
              <InfoLine key={detail.label} href={detail.href} label={detail.label} value={detail.value || ""} />
            ))}
            {status?.status ? <InfoLine label={statusLabel} value={status.status} /> : null}
            {status?.error ? <InfoLine label="Docker" value={status.error} /> : null}
          </div>
        ) : null}
        {children}
      </div>
    </AccordionPanel>
  );
}
