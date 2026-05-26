import type { ReactNode } from "react";
import type { StreamState, ViewConfig } from "@/entities/infrastructure";
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
  terminalStateLabels: Record<StreamState, string>;
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
  terminalStateLabels,
  terminalTitle,
  view,
  onInput,
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
        {showTerminal ? (
          <Terminal
            actionLabels={terminalActionLabels}
            collapsible={Boolean(onToggleTerminal)}
            cwd={terminalCwd}
            output={output}
            state={streamState}
            stateLabels={terminalStateLabels}
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
