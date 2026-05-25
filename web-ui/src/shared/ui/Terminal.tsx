import { Minimize2, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "./Button";

type TerminalState = "done" | "error" | "ready" | "running" | "stopped";

type TerminalProps = {
  actionLabels: {
    clear: string;
    hide: string;
    inputPlaceholder: string;
    stop: string;
  };
  collapsible?: boolean;
  cwd: string;
  inputEnabled?: boolean;
  output: string;
  prompt?: string;
  state: TerminalState;
  title: string;
  onClear: () => void;
  onCollapse?: () => void;
  onInput?: (input: string) => void;
  onStop: () => void;
};

export function Terminal({
  actionLabels,
  collapsible = false,
  cwd,
  inputEnabled = false,
  onClear,
  onCollapse,
  onInput,
  onStop,
  output,
  prompt = "$",
  state,
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
    <section className="flex min-h-[320px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-[#070806] shadow-2xl shadow-black/35">
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
        <div className="flex flex-wrap gap-2">
          {collapsible ? (
            <Button icon={<Minimize2 size={15} />} onClick={onCollapse}>
              {actionLabels.hide}
            </Button>
          ) : null}
          <Button tone="danger" icon={<Square size={14} />} disabled={state !== "running"} onClick={onStop}>
            {actionLabels.stop}
          </Button>
          <Button icon={<Trash2 size={15} />} onClick={onClear}>
            {actionLabels.clear}
          </Button>
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
