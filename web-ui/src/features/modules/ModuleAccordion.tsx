import { ArrowDown, ArrowUp, ChevronDown, ListTree, Play, Plus, Square, TerminalSquare, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { ContainerStateInfo } from "../../shared/api/containers";
import type { CommandAction, ContainerRuntimeState, ShellAction } from "../../shared/types/commands";

type ModuleAccordionProps = {
  actions: CommandAction[];
  defaultOpen?: boolean;
  details?: Array<{ label: string; value?: string }>;
  eyebrow: string;
  shell?: ShellAction;
  status?: ContainerStateInfo;
  statusLabel?: string;
  title: string;
  onRun: (action: CommandAction) => void;
  onShellOpen?: (action: ShellAction) => void;
};

type ActionSuffix = "add" | "clean" | "delete" | "down" | "logs" | "start" | "stop" | "up";
type IconTone = "danger" | "default" | "primary" | "success";

const actionOrder: ActionSuffix[] = ["up", "down", "start", "stop", "logs", "clean", "add", "delete"];
const actionIcon: Record<ActionSuffix | "shell", ReactNode> = {
  add: <Plus size={16} strokeWidth={2.7} />,
  clean: <Trash2 size={16} strokeWidth={2.5} />,
  delete: <Trash2 size={16} strokeWidth={2.5} />,
  down: <ArrowDown size={16} strokeWidth={2.7} />,
  logs: <ListTree size={16} strokeWidth={2.4} />,
  shell: <TerminalSquare size={16} strokeWidth={2.4} />,
  start: <Play size={16} strokeWidth={2.6} />,
  stop: <Square size={15} strokeWidth={2.6} />,
  up: <ArrowUp size={16} strokeWidth={2.7} />,
};
const actionTone: Record<ActionSuffix | "shell", IconTone> = {
  add: "success",
  clean: "danger",
  delete: "danger",
  down: "danger",
  logs: "default",
  shell: "primary",
  start: "default",
  stop: "danger",
  up: "success",
};

export function ModuleAccordion({
  actions,
  defaultOpen = false,
  details = [],
  eyebrow,
  onRun,
  onShellOpen,
  shell,
  status,
  statusLabel = "Status",
  title,
}: ModuleAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const orderedActions = useMemo(() => orderActions(actions), [actions]);
  const visibleDetails = details.filter((detail) => detail.value);

  return (
    <section className={`infra-accordion module-accordion ${open ? "is-open" : ""}`}>
      <header className="infra-accordion-head module-accordion-head" onClick={() => setOpen((value) => !value)}>
        <span className="accordion-toggle compact">
          <span className="accordion-title-block">
            <span className="accordion-eyebrow">{eyebrow}</span>
            <strong>{title}</strong>
          </span>
        </span>

        <span className="accordion-head-actions" onClick={(event) => event.stopPropagation()}>
          {status ? <StatusDot state={status.state} /> : null}
          {orderedActions.map(({ action, suffix }) => (
            <IconAction key={action.id} label={action.label} tone={actionTone[suffix]} onClick={() => onRun(action)}>
              {actionIcon[suffix]}
            </IconAction>
          ))}
          {shell ? (
            <IconAction label={shell.label} tone={actionTone.shell} onClick={() => onShellOpen?.(shell)}>
              {actionIcon.shell}
            </IconAction>
          ) : null}
        </span>

        <ChevronDown className="accordion-chevron" size={18} strokeWidth={2.4} />
      </header>

      {open ? (
        <div className="infra-accordion-body module-accordion-body">
          {visibleDetails.length > 0 || status?.status || status?.error ? (
            <div className="module-detail-grid">
              {visibleDetails.map((detail) => (
                <InfoLine key={detail.label} label={detail.label} value={detail.value || ""} />
              ))}
              {status?.status ? <InfoLine label={statusLabel} value={status.status} /> : null}
              {status?.error ? <InfoLine label="Docker" value={status.error} /> : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function IconAction({
  children,
  label,
  onClick,
  tone,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone: IconTone;
}) {
  return (
    <button
      aria-label={label}
      className={`icon-action icon-action-${tone}`}
      title={label}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function StatusDot({ state }: { state: ContainerRuntimeState }) {
  return <span className={`status-dot status-dot-${state}`} title={state} />;
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function orderActions(actions: CommandAction[]) {
  const indexed = actions.map((action, index) => ({
    action,
    index,
    suffix: action.id.split(":")[1] as ActionSuffix,
  }));

  return indexed
    .filter((item) => actionOrder.includes(item.suffix))
    .sort(
      (left, right) => actionOrder.indexOf(left.suffix) - actionOrder.indexOf(right.suffix) || left.index - right.index,
    );
}
