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
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-zinc-800/90 bg-zinc-950/50 px-5 py-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={18} />
        <strong className="truncate text-sm font-bold text-zinc-100">{pageTitle}</strong>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition ${
            terminalOpen
              ? "border-teal-300/45 bg-teal-400/12 text-teal-100"
              : "border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-zinc-600 hover:text-zinc-100"
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
