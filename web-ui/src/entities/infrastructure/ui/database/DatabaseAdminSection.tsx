import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { AccordionPanel, IconLink } from "@/shared/ui";
import { DatabaseAction, InfoLine, ShellIconButton, StatusDot } from "../DatabaseControls";
import { commandActionsBySuffix, databaseActionOrder } from "./types";
import type { DatabaseAdminSectionProps } from "./types";

export function DatabaseAdminSection({
  actions,
  copy,
  eyebrow,
  link,
  onOpenChange,
  onRun,
  onShellOpen,
  open,
  overview,
  shell,
  title,
}: DatabaseAdminSectionProps) {
  const actionsBySuffix = useMemo(() => commandActionsBySuffix(actions), [actions]);

  return (
    <AccordionPanel
      eyebrow={eyebrow}
      open={open}
      title={title}
      actions={
        <>
          <StatusDot state={overview.state} />
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
                label={commandAction.label}
                onClick={() => onRun(commandAction)}
              />
            ) : null;
          })}
          {shell ? <ShellIconButton label={copy.shellLabel} onClick={() => onShellOpen(shell)} /> : null}
        </>
      }
      onOpenChange={onOpenChange}
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <InfoLine label={copy.containerLabel} value={overview.container} />
        <InfoLine label={copy.domainLabel} value={overview.domain || copy.domainUnknown} />
        {link ? <InfoLine href={link.url} label={copy.linkLabel} value={link.url} /> : null}
        {overview.status ? <InfoLine label={copy.statusLabel} value={overview.status} /> : null}
      </div>
    </AccordionPanel>
  );
}
