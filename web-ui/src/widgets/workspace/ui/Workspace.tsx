import type { ReactNode } from "react";
import type { TerminalState, ViewConfig } from "@/entities/infrastructure";
import { SshTerminalPanel } from "@/features/ssh-terminal";
import type { SshTerminalAction } from "@/features/ssh-terminal";
import { Terminal } from "@/shared/ui";
import { TopBar } from "./TopBar";

type WorkspaceProps = {
  children?: ReactNode;
  pageTitle: string;
  terminalActionLabels: {
    clear: string;
    hide: string;
    inputPlaceholder: string;
    stop: string;
  };
  terminalCwd: string;
  terminalInputEnabled?: boolean;
  terminalOpen?: boolean;
  terminalPrompt?: string;
  terminalStateLabels: Record<TerminalState, string>;
  terminalLabel: string;
  terminalTitle: string;
  sshTerminal?: {
    action: SshTerminalAction;
    cwd: string;
    serverId: number;
    title: string;
  } | null;
  output: string;
  terminalState: TerminalState;
  view: ViewConfig;
  onClear: () => void;
  onInput?: (input: string) => void;
  onResize?: (cols: number, rows: number) => void;
  onToggleTerminal?: () => void;
  onStop: () => void;
};

export function Workspace({
  children,
  onClear,
  onStop,
  onToggleTerminal,
  output,
  pageTitle,
  sshTerminal = null,
  terminalActionLabels,
  terminalCwd,
  terminalInputEnabled = false,
  terminalLabel,
  terminalOpen = true,
  terminalPrompt,
  terminalState,
  terminalStateLabels,
  terminalTitle,
  view,
  onInput,
  onResize,
}: WorkspaceProps) {
  const showTerminal = terminalOpen;

  return (
    <section className="min-w-0">
      <TopBar
        pageTitle={pageTitle}
        terminalLabel={terminalLabel}
        terminalOpen={terminalOpen}
        view={view}
        onToggleTerminal={onToggleTerminal}
      />
      <div
        className={`grid h-[calc(100vh-64px)] min-h-0 gap-4 p-4 ${
          children && showTerminal ? "grid-cols-[minmax(0,1fr)_minmax(360px,42vw)]" : "grid-cols-1"
        } max-[1180px]:h-auto max-[1180px]:grid-cols-1`}
      >
        {children ? <div className="min-h-0 overflow-auto pr-1 max-[1180px]:overflow-visible">{children}</div> : null}
        {showTerminal && sshTerminal ? (
          <SshTerminalPanel
            action={sshTerminal.action}
            actionLabels={terminalActionLabels}
            cwd={sshTerminal.cwd}
            serverId={sshTerminal.serverId}
            stateLabels={terminalStateLabels}
            title={sshTerminal.title}
          />
        ) : showTerminal ? (
          <Terminal
            actionLabels={terminalActionLabels}
            cwd={terminalCwd}
            output={output}
            state={terminalState}
            stateLabels={terminalStateLabels}
            inputEnabled={terminalInputEnabled}
            prompt={terminalPrompt}
            title={terminalTitle}
            onClear={onClear}
            onInput={onInput}
            onResize={onResize}
            onStop={onStop}
          />
        ) : null}
      </div>
    </section>
  );
}
