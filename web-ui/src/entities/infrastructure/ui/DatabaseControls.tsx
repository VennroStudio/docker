import { ArrowDown, ArrowUp, ListTree, Play, Square, TerminalSquare, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib";
import { IconButton } from "@/shared/ui";
import type { ContainerRuntimeState, MariaDbInstanceAction } from "../model/types";

const actionIcon = {
  clean: <Trash2 size={16} strokeWidth={2.5} />,
  down: <ArrowDown size={16} strokeWidth={2.7} />,
  logs: <ListTree size={16} strokeWidth={2.4} />,
  shell: <TerminalSquare size={16} strokeWidth={2.4} />,
  start: <Play size={16} strokeWidth={2.6} />,
  stop: <Square size={15} strokeWidth={2.6} />,
  up: <ArrowUp size={16} strokeWidth={2.7} />,
};

const actionTone = {
  clean: "danger",
  down: "danger",
  logs: "default",
  shell: "primary",
  start: "default",
  stop: "danger",
  up: "success",
} as const;

export function DatabaseAction({
  action,
  disabled,
  label,
  loading,
  onClick,
  title,
}: {
  action: MariaDbInstanceAction;
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <IconButton
      disabled={disabled}
      label={label}
      loading={loading}
      title={title}
      tone={actionTone[action]}
      onClick={onClick}
    >
      {actionIcon[action]}
    </IconButton>
  );
}

export function ShellIconButton({
  disabled,
  label,
  loading,
  onClick,
  title,
}: {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <IconButton disabled={disabled} label={label} loading={loading} title={title} tone="primary" onClick={onClick}>
      {actionIcon.shell}
    </IconButton>
  );
}

export function StatusDot({ state }: { state: ContainerRuntimeState }) {
  const stateClass = {
    created: "bg-amber-300 text-amber-300",
    dead: "bg-red-500 text-red-500",
    exited: "bg-amber-300 text-amber-300",
    missing: "bg-slate-400 text-slate-400",
    paused: "bg-amber-300 text-amber-300",
    removing: "bg-red-400 text-red-400",
    restarting: "bg-red-400 text-red-400",
    running: "bg-[#52ff8f] text-[#52ff8f]",
    stopped: "bg-amber-300 text-amber-300",
    unknown: "bg-slate-400 text-slate-400",
  }[state];

  return (
    <span
      className={cn("h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_20px_currentColor]", stateClass)}
      title={state}
    />
  );
}

export function InfoLine({ href, label, value }: { href?: string; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-sky-100 bg-white/80 px-3 py-2 shadow-[0_7px_16px_rgba(14,165,233,0.10)]">
      <span className="block text-[11px] font-semibold uppercase text-slate-500">{label}</span>
      {href ? (
        <a
          className="mt-1 block truncate text-sm font-semibold text-teal-700 hover:text-teal-800"
          href={href}
          rel="noreferrer"
          target="_blank"
        >
          {value}
        </a>
      ) : (
        <strong className="mt-1 block truncate text-sm text-slate-950">{value}</strong>
      )}
    </div>
  );
}
