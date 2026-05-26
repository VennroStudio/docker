import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { InfoLine, StatusDot } from "@/entities/infrastructure";
import type { ContainerStateInfo } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type { CommandAction, ShellAction } from "@/entities/infrastructure";
import { AccordionPanel, IconLink } from "@/shared/ui";
import { moduleActionIcon, moduleActionTone, orderModuleActions } from "../model/moduleActions";
import { ModuleActionButton } from "./ModuleActionButton";

type ServiceModuleAccordionProps = {
  actions: CommandAction[];
  defaultOpen?: boolean;
  details?: Array<{ href?: string; label: string; value?: string }>;
  eyebrow: string;
  link?: ServiceLink;
  shell?: ShellAction;
  status?: ContainerStateInfo;
  statusLabel?: string;
  title: string;
  onRun: (action: CommandAction) => void;
  onShellOpen?: (action: ShellAction) => void;
};

export function ServiceModuleAccordion({
  actions,
  defaultOpen = false,
  details = [],
  eyebrow,
  link,
  onRun,
  onShellOpen,
  shell,
  status,
  statusLabel = "Status",
  title,
}: ServiceModuleAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const orderedActions = useMemo(() => orderModuleActions(actions), [actions]);
  const visibleDetails = details.filter((detail) => detail.value);

  return (
    <AccordionPanel
      contentClassName="px-4 py-4"
      defaultTitleElement="span"
      eyebrow={eyebrow}
      open={open}
      title={title}
      actions={
        <>
          {status ? <StatusDot state={status.state} /> : null}
          {link ? (
            <IconLink href={link.url} label={link.label} title={link.url}>
              <ExternalLink size={16} strokeWidth={2.5} />
            </IconLink>
          ) : null}
          {orderedActions.map(({ action, suffix }) => (
            <ModuleActionButton
              key={action.id}
              label={action.label}
              tone={moduleActionTone[suffix]}
              onClick={() => onRun(action)}
            >
              {moduleActionIcon[suffix]}
            </ModuleActionButton>
          ))}
          {shell ? (
            <ModuleActionButton label={shell.label} tone={moduleActionTone.shell} onClick={() => onShellOpen?.(shell)}>
              {moduleActionIcon.shell}
            </ModuleActionButton>
          ) : null}
        </>
      }
      onOpenChange={setOpen}
    >
      {visibleDetails.length > 0 || status?.status || status?.error ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleDetails.map((detail) => (
            <InfoLine key={detail.label} href={detail.href} label={detail.label} value={detail.value || ""} />
          ))}
          {status?.status ? <InfoLine label={statusLabel} value={status.status} /> : null}
          {status?.error ? <InfoLine label="Docker" value={status.error} /> : null}
        </div>
      ) : null}
    </AccordionPanel>
  );
}
