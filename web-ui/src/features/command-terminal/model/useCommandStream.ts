import { useRef, useState } from "react";
import type { TerminalSession } from "../api/terminalClient";
import type { StreamState } from "@/entities/infrastructure";

type StreamHandlers = {
  onMessage: (text: string) => void;
  onDone: (text: string, ok: boolean) => void;
  onError: (text: string) => void;
};

type OpenStream = (handlers: StreamHandlers) => TerminalSession;
type RunResult = {
  ok: boolean;
  text: string;
};
type RunOptions = {
  onSettled?: (result: RunResult) => void;
};

const idleOutput = "Waiting for action...";

export function useCommandStream() {
  const [output, setOutput] = useState(idleOutput);
  const [streamState, setStreamState] = useState<StreamState>("ready");
  const terminalSession = useRef<null | TerminalSession>(null);

  const append = (text: string) => {
    setOutput((current) => `${current}${text}`);
  };

  const run = (preview: string, open: OpenStream, options: RunOptions = {}) => {
    terminalSession.current?.stop();
    terminalSession.current = null;
    setOutput(`${preview}\n\n`);
    setStreamState("running");
    const handlers: StreamHandlers = {
      onMessage: append,
      onDone: (text, ok) => {
        append(text);
        terminalSession.current = null;
        setStreamState(ok ? "done" : "error");
        options.onSettled?.({ ok, text });
      },
      onError: (text) => {
        append(text);
        terminalSession.current = null;
        setStreamState("error");
        options.onSettled?.({ ok: false, text });
      },
    };

    try {
      terminalSession.current = open(handlers);
    } catch (error) {
      const text = `\n${error instanceof Error ? error.message : String(error)}\n`;
      append(text);
      terminalSession.current = null;
      setStreamState("error");
      options.onSettled?.({ ok: false, text });
    }
  };

  const stop = () => {
    terminalSession.current?.stop();
    terminalSession.current = null;
    setStreamState("stopped");
    append("\n[stopped]\n");
  };

  const sendInput = (input: string) => {
    terminalSession.current?.send(input);
  };

  const resize = (cols: number, rows: number) => terminalSession.current?.resize(cols, rows);
  const clear = () => setOutput(idleOutput);

  return {
    clear,
    inputEnabled: Boolean(terminalSession.current && streamState === "running"),
    output,
    prompt: "$",
    resize,
    run,
    sendInput,
    stop,
    streamState,
  };
}
