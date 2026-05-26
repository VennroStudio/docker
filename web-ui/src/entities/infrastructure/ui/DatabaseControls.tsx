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
    missing: "bg-zinc-500 text-zinc-500",
    running: "bg-[#52ff8f] text-[#52ff8f]",
    stopped: "bg-amber-300 text-amber-300",
    unknown: "bg-zinc-400 text-zinc-400",
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
