import { TerminalSquare } from "lucide-react";
import type { ViewConfig } from "../../shared/types/commands";

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
    <header className="topbar">
      <div className="breadcrumb">
        <Icon size={18} />
        <strong>{pageTitle}</strong>
      </div>
      <div className="top-actions">
        <button
          className={`terminal-toggle ${terminalOpen ? "active" : ""}`.trim()}
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
