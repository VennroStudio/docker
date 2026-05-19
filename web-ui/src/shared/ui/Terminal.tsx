import { Minimize2, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { StreamState } from "../types/commands";
import { Button } from "./Button";

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
  state: StreamState;
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
    <section className="terminal-card">
      <header className="terminal-bar">
        <div className="traffic" aria-hidden="true">
          <span className="red" />
          <span className="yellow" />
          <span className="green" />
        </div>
        <div className="terminal-title">
          <strong>{title}</strong>
          <span>{cwd}</span>
        </div>
        <div className="terminal-actions">
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
      <pre ref={outputRef} className="terminal-output">
        {output}
      </pre>
      <form className="terminal-input-row" onSubmit={submitInput}>
        <span>{inputEnabled ? prompt : "$"}</span>
        <input
          disabled={!inputEnabled}
          placeholder={actionLabels.inputPlaceholder}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </form>
    </section>
  );
}
