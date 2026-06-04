import { useRef, useState } from "react";
import type { TerminalState } from "@/entities/infrastructure";
import type { TerminalSession } from "../api/terminalClient";

type TerminalHandlers = {
  onMessage: (text: string) => void;
  onDone: (text: string, ok: boolean) => void;
  onError: (text: string) => void;
};

type OpenTerminal = (handlers: TerminalHandlers) => TerminalSession;
type RunResult = {
  ok: boolean;
  text: string;
};
type RunOptions = {
  onSettled?: (result: RunResult) => void;
};

const idleOutput = "Waiting for action...";

export function useTerminalSession() {
  const [output, setOutput] = useState(idleOutput);
  const [terminalState, setTerminalState] = useState<TerminalState>("ready");
  const terminalSession = useRef<null | TerminalSession>(null);

  const append = (text: string) => {
    setOutput((current) => `${current}${text}`);
  };

  const run = (preview: string, open: OpenTerminal, options: RunOptions = {}) => {
    terminalSession.current?.stop();
    terminalSession.current = null;
    setOutput(`${preview}\n\n`);
    setTerminalState("running");
    const handlers: TerminalHandlers = {
      onMessage: append,
      onDone: (text, ok) => {
        append(text);
        terminalSession.current = null;
        setTerminalState(ok ? "done" : "error");
        options.onSettled?.({ ok, text });
      },
      onError: (text) => {
        append(text);
        terminalSession.current = null;
        setTerminalState("error");
        options.onSettled?.({ ok: false, text });
      },
    };

    try {
      terminalSession.current = open(handlers);
    } catch (error) {
      const text = `\n${error instanceof Error ? error.message : String(error)}\n`;
      append(text);
      terminalSession.current = null;
      setTerminalState("error");
      options.onSettled?.({ ok: false, text });
    }
  };

  const stop = () => {
    terminalSession.current?.stop();
    terminalSession.current = null;
    setTerminalState("stopped");
    append("\n[stopped]\n");
  };

  const sendInput = (input: string) => {
    terminalSession.current?.send(input);
  };

  const resize = (cols: number, rows: number) => terminalSession.current?.resize(cols, rows);
  const clear = () => setOutput(idleOutput);

  return {
    clear,
    inputEnabled: terminalState === "running",
    output,
    prompt: "$",
    resize,
    run,
    sendInput,
    stop,
    terminalState,
  };
}
