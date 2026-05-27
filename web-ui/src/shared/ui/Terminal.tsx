import { BrushCleaning, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
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
  prompt = "$",
  state,
  stateLabels,
  title,
}: TerminalProps) {
  const outputRef = useRef<HTMLPreElement>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!outputRef.current) return;
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  const submitInput = (event: FormEvent) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || !inputEnabled) return;

    setInput("");
    onInput?.(value);
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
            onClick={onClear}
          />
        </div>
      </header>
      <pre
        ref={outputRef}
        className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[12px] leading-5 text-emerald-100/88"
      >
        {output}
      </pre>
      <form
        className="flex items-center gap-3 border-t border-zinc-800 bg-zinc-950/90 px-4 py-3"
        onSubmit={submitInput}
      >
        <span className="shrink-0 font-mono text-xs text-teal-200">{inputEnabled ? prompt : "$"}</span>
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
          disabled={!inputEnabled}
          placeholder={actionLabels.inputPlaceholder}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </form>
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
