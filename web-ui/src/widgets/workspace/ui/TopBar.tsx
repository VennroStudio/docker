import { TerminalSquare } from "lucide-react";
import type { ViewConfig } from "@/entities/infrastructure";

type TopBarProps = {
  pageTitle: string;
  terminalOpen: boolean;
  terminalLabel: string;
  view: ViewConfig;
  onToggleTerminal?: () => void;
};

export function TopBar({ onToggleTerminal, pageTitle, terminalLabel, terminalOpen, view }: TopBarProps) {
  const Icon = view.icon;

  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-sky-100/90 bg-white/82 px-5 py-3 shadow-[0_10px_28px_rgba(14,165,233,0.10)] backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={18} />
        <strong className="truncate text-sm font-bold text-slate-900">{pageTitle}</strong>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
            terminalOpen
              ? "border-teal-400/70 bg-teal-50 text-teal-700 shadow-[0_8px_18px_rgba(20,184,166,0.18)]"
              : "border-sky-100 bg-white text-slate-600 shadow-[0_6px_14px_rgba(14,165,233,0.10)] hover:border-sky-200 hover:text-slate-950"
          }`}
          type="button"
          aria-pressed={terminalOpen}
          onClick={onToggleTerminal}
        >
          <TerminalSquare size={17} />
          <span>{terminalLabel}</span>
        </button>
      </div>
    </header>
  );
}
