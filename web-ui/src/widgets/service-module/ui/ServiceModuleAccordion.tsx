import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ExternalLink,
  ListTree,
  Play,
  Plus,
  Square,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { ContainerStateInfo } from "@/entities/infrastructure";
import type { ServiceLink } from "@/entities/infrastructure";
import type { CommandAction, ContainerRuntimeState, ShellAction } from "@/entities/infrastructure";
import { cn } from "@/shared/lib";

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
  const orderedActions = useMemo(() => orderActions(actions), [actions]);
  const visibleDetails = details.filter((detail) => detail.value);

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/54 shadow-sm shadow-black/20">
      <header
        className="flex cursor-pointer items-center gap-4 px-4 py-3 transition hover:bg-white/[0.03]"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase text-zinc-500">{eyebrow}</span>
          <span className="mt-1 block truncate text-base font-bold text-zinc-50">{title}</span>
        </span>

        <span
          className="flex shrink-0 flex-wrap items-center justify-end gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          {status ? <StatusDot state={status.state} /> : null}
          {link ? (
            <a
              aria-label={link.label}
              className="grid h-9 w-9 place-items-center rounded-lg border border-teal-300/30 bg-teal-400/10 text-teal-100 transition hover:border-teal-200/60 hover:bg-teal-400/18"
              href={link.url}
              rel="noreferrer"
              target="_blank"
              title={link.url}
            >
              <ExternalLink size={16} strokeWidth={2.5} />
            </a>
          ) : null}
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

        <ChevronDown
          className={cn("shrink-0 text-zinc-500 transition", open && "rotate-180 text-zinc-200")}
          size={18}
          strokeWidth={2.4}
        />
      </header>

      {open ? (
        <div className="border-t border-zinc-800 px-4 py-4">
          {visibleDetails.length > 0 || status?.status || status?.error ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleDetails.map((detail) => (
                <InfoLine key={detail.label} href={detail.href} label={detail.label} value={detail.value || ""} />
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
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg border transition outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60",
        {
          danger: "border-red-400/25 bg-red-500/10 text-red-100 hover:border-red-300/60 hover:bg-red-500/18",
          default: "border-zinc-700/70 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-zinc-50",
          primary: "border-teal-300/30 bg-teal-400/10 text-teal-100 hover:border-teal-200/60 hover:bg-teal-400/18",
          success:
            "border-emerald-300/28 bg-emerald-400/10 text-emerald-100 hover:border-emerald-200/60 hover:bg-emerald-400/18",
        }[tone],
      )}
      title={label}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function StatusDot({ state }: { state: ContainerRuntimeState }) {
  const stateClass = {
    missing: "bg-zinc-500",
    running: "bg-emerald-300",
    stopped: "bg-amber-300",
    unknown: "bg-zinc-400",
  }[state];

  return <span className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_18px_currentColor]", stateClass)} title={state} />;
}

function InfoLine({ href, label, value }: { href?: string; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-900/45 px-3 py-2">
      <span className="block text-[11px] font-semibold uppercase text-zinc-500">{label}</span>
      {href ? (
        <a
          className="mt-1 block truncate text-sm font-semibold text-teal-200 hover:text-teal-100"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          {value}
        </a>
      ) : (
        <strong className="mt-1 block truncate text-sm text-zinc-100">{value}</strong>
      )}
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
