import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { BrushCleaning, Square } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/shared/lib";
import { Button } from "./Button";

type TerminalState = "done" | "error" | "ready" | "running" | "stopped";

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
  state: TerminalState;
  stateLabels: Record<TerminalState, string>;
  title: string;
  onClear: () => void;
  onInput?: (input: string) => void;
  onStop: () => void;
};

export function Terminal({
  actionLabels,
  cwd,
  inputEnabled = false,
  onClear,
  onInput,
  onStop,
  output,
  state,
  stateLabels,
  title,
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const inputBufferRef = useRef("");
  const inputEnabledRef = useRef(inputEnabled);
  const lastOutputRef = useRef("");
  const onInputRef = useRef(onInput);
  const terminalRef = useRef<XTerm | null>(null);

  useEffect(() => {
    inputEnabledRef.current = inputEnabled;
  }, [inputEnabled]);

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  useEffect(() => {
    if (!containerRef.current) return;

    const terminal = new XTerm({
      convertEol: true,
      cursorBlink: state === "running",
      cursorStyle: "block",
      disableStdin: false,
      fontFamily: "Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
      fontSize: 12,
      lineHeight: 1.25,
      scrollback: 5000,
      theme: {
        background: "#070806",
        black: "#0f172a",
        blue: "#38bdf8",
        brightBlack: "#475569",
        brightBlue: "#7dd3fc",
        brightCyan: "#5eead4",
        brightGreen: "#86efac",
        brightMagenta: "#f0abfc",
        brightRed: "#fca5a5",
        brightWhite: "#ffffff",
        brightYellow: "#fde68a",
        cursor: "#5eead4",
        cyan: "#2dd4bf",
        foreground: "#d1fae5",
        green: "#4ade80",
        magenta: "#d946ef",
        red: "#ef4444",
        selectionBackground: "#164e63",
        white: "#e2e8f0",
        yellow: "#facc15",
      },
    });
    const fit = new FitAddon();

    terminal.loadAddon(fit);
    terminal.open(containerRef.current);
    terminal.write(output);
    fit.fit();

    terminalRef.current = terminal;
    fitRef.current = fit;
    lastOutputRef.current = output;

    const inputDisposable = terminal.onData((data) => {
      if (!inputEnabledRef.current) return;

      if (data === "\r") {
        const input = inputBufferRef.current;
        inputBufferRef.current = "";
        if (input) onInputRef.current?.(input);
        return;
      }

      if (data === "\u007F") {
        inputBufferRef.current = inputBufferRef.current.slice(0, -1);
        return;
      }

      if (data >= " ") inputBufferRef.current += data;
    });
    const resizeObserver = new ResizeObserver(() => fit.fit());

    resizeObserver.observe(containerRef.current);

    return () => {
      inputDisposable.dispose();
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitRef.current = null;
      inputBufferRef.current = "";
      lastOutputRef.current = "";
    };
  }, []);

  useEffect(() => {
    const terminal = terminalRef.current;
    if (terminal) terminal.options.cursorBlink = state === "running";
  }, [state]);

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return;

    const previous = lastOutputRef.current;
    if (output.startsWith(previous)) {
      terminal.write(output.slice(previous.length));
    } else {
      terminal.clear();
      terminal.write(output);
    }

    lastOutputRef.current = output;
    terminal.scrollToBottom();
  }, [output]);

  const clear = () => {
    terminalRef.current?.clear();
    lastOutputRef.current = "";
    onClear();
  };

  return (
    <section className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-sky-900/70 bg-[#070806] shadow-[0_18px_50px_rgba(14,165,233,0.18),0_10px_30px_rgba(168,85,247,0.12)]">
      <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-red-400/90" />
          <span className="h-3 w-3 rounded-full bg-amber-300/90" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/90" />
        </div>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-sm font-bold text-zinc-100">{title}</strong>
          <span className="block truncate text-xs text-zinc-500">{cwd}</span>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-md border px-2 py-1 text-xs font-bold uppercase",
            terminalStateClass(state),
          )}
        >
          <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_14px_currentColor]" />
          {stateLabels[state]}
        </span>
        <div className="flex flex-wrap gap-2">
          <Button
            aria-label={actionLabels.stop}
            className="border-red-400/35 bg-red-500/12 px-3 text-red-100 hover:border-red-300/60 hover:bg-red-500/20"
            disabled={state !== "running"}
            icon={<Square size={14} />}
            title={actionLabels.stop}
            tone="danger"
            onClick={onStop}
          />
          <Button
            aria-label={actionLabels.clear}
            className="border-zinc-700/80 bg-zinc-900 px-3 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800 hover:text-zinc-50"
            icon={<BrushCleaning size={16} />}
            title={actionLabels.clear}
            onClick={clear}
          />
        </div>
      </header>
      <div
        ref={containerRef}
        aria-label={actionLabels.inputPlaceholder}
        className="min-h-0 flex-1 overflow-hidden p-3"
        onClick={() => terminalRef.current?.focus()}
      />
    </section>
  );
}

function terminalStateClass(state: TerminalState) {
  return {
    done: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    error: "border-red-300/30 bg-red-500/10 text-red-100",
    ready: "border-zinc-700/80 bg-zinc-900 text-zinc-400",
    running: "border-teal-300/30 bg-teal-400/10 text-teal-100",
    stopped: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  }[state];
}
