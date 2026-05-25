import { ArrowDown, ArrowUp, ExternalLink, ListTree, Play, Square, TerminalSquare, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib";
import type { ContainerRuntimeState, MariaDbInstanceAction } from "../model/types";

const actionIcon = {
  clean: <Trash2 size={16} strokeWidth={2.5} />,
  down: <ArrowDown size={16} strokeWidth={2.7} />,
  link: <ExternalLink size={16} strokeWidth={2.5} />,
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
  label,
  onClick,
}: {
  action: MariaDbInstanceAction;
  label: string;
  onClick: () => void;
}) {
  return (
    <IconAction label={label} tone={actionTone[action]} onClick={onClick}>
      {actionIcon[action]}
    </IconAction>
  );
}

export function ShellIconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <IconAction label={label} tone="primary" onClick={onClick}>
      {actionIcon.shell}
    </IconAction>
  );
}

export function IconAction({
  children,
  label,
  onClick,
  tone,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  tone: "danger" | "default" | "primary" | "success";
}) {
  return (
    <button
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

export function StatusDot({ state }: { state: ContainerRuntimeState }) {
  const stateClass = {
    missing: "bg-zinc-500",
    running: "bg-emerald-300",
    stopped: "bg-amber-300",
    unknown: "bg-zinc-400",
  }[state];

  return (
    <span
      className={cn("h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_18px_currentColor]", stateClass)}
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
