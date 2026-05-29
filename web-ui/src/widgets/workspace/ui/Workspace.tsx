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
    input?: {
      data: string;
      id: number;
    };
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
        className={`grid min-h-0 gap-4 p-4 ${
          children && showTerminal ? "grid-cols-[minmax(0,1fr)_minmax(360px,42vw)]" : "grid-cols-1"
        } max-[1180px]:grid-cols-1`}
      >
        {children ? <div className="min-h-0 pr-1">{children}</div> : null}
        {showTerminal && sshTerminal ? (
          <div className="sticky top-20 h-[calc(100vh-6rem)] min-h-[360px] max-[1180px]:static max-[1180px]:h-[420px]">
            <SshTerminalPanel
              key={`${sshTerminal.action}:${sshTerminal.serverId}`}
              action={sshTerminal.action}
              actionLabels={terminalActionLabels}
              cwd={sshTerminal.cwd}
              input={sshTerminal.input}
              serverId={sshTerminal.serverId}
              stateLabels={terminalStateLabels}
              title={sshTerminal.title}
            />
          </div>
        ) : showTerminal ? (
          <div className="sticky top-20 h-[calc(100vh-6rem)] min-h-[360px] max-[1180px]:static max-[1180px]:h-[420px]">
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
          </div>
        ) : null}
      </div>
    </section>
  );
}
