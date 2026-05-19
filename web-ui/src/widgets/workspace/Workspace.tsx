import type { ReactNode } from "react";
import type { StreamState, ViewConfig } from "../../shared/types/commands";
import { Terminal } from "../../shared/ui/Terminal";
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
  terminalLabel: string;
  terminalTitle: string;
  output: string;
  streamState: StreamState;
  view: ViewConfig;
  onClear: () => void;
  onInput?: (input: string) => void;
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
  streamState,
  terminalActionLabels,
  terminalCwd,
  terminalInputEnabled = false,
  terminalLabel,
  terminalOpen = true,
  terminalPrompt,
  terminalTitle,
  view,
  onInput,
}: WorkspaceProps) {
  const showTerminal = terminalOpen;

  return (
    <section className="workspace">
      <TopBar
        pageTitle={pageTitle}
        terminalLabel={terminalLabel}
        terminalOpen={terminalOpen}
        view={view}
        onToggleTerminal={onToggleTerminal}
      />
      <div className={`workspace-body ${children ? "with-page" : ""} ${showTerminal ? "" : "terminal-hidden"}`.trim()}>
        {children ? <div className="workspace-page">{children}</div> : null}
        {showTerminal ? (
          <Terminal
            actionLabels={terminalActionLabels}
            collapsible={Boolean(onToggleTerminal)}
            cwd={terminalCwd}
            output={output}
            state={streamState}
            inputEnabled={terminalInputEnabled}
            prompt={terminalPrompt}
            title={terminalTitle}
            onClear={onClear}
            onCollapse={onToggleTerminal}
            onInput={onInput}
            onStop={onStop}
          />
        ) : null}
      </div>
    </section>
  );
}
