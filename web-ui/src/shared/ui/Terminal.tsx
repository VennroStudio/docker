import { XtermPanel, type TerminalPanelState } from "./XtermPanel";

type TerminalProps = {
  actionLabels: {
    clear: string;
    hide: string;
    inputPlaceholder: string;
    stop: string;
  };
  cwd: string;
  inputEnabled?: boolean;
  output: string;
  prompt?: string;
  state: TerminalPanelState;
  stateLabels: Record<TerminalPanelState, string>;
  title: string;
  onClear: () => void;
  onInput?: (input: string) => void;
  onResize?: (cols: number, rows: number) => void;
  onStop: () => void;
};

export function Terminal({
  actionLabels,
  cwd,
  inputEnabled = false,
  onClear,
  onInput,
  onResize,
  onStop,
  output,
  state,
  stateLabels,
  title,
}: TerminalProps) {
  return (
    <XtermPanel
      actionLabels={actionLabels}
      cwd={cwd}
      inputEnabled={inputEnabled}
      output={output}
      state={state}
      stateLabels={stateLabels}
      title={title}
      onClear={onClear}
      onInput={onInput}
      onResize={onResize}
      onStop={onStop}
    />
  );
}
