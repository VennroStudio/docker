import { useRef, useState } from "react";
import { sendShellInput, stopShellSession } from "../../../shared/api/stream";
import type { StreamState } from "../../../shared/types/commands";

type StreamHandlers = {
  onPrompt?: (prompt: string) => void;
  onSession?: (sessionId: string) => void;
  onMessage: (text: string) => void;
  onDone: (text: string, ok: boolean) => void;
  onError: (text: string) => void;
};

type OpenStream = (handlers: StreamHandlers) => () => void;
type RunOptions = {
  onSettled?: () => void;
};

const idleOutput = "Waiting for action...";

export function useCommandStream() {
  const [output, setOutput] = useState(idleOutput);
  const [shellPrompt, setShellPrompt] = useState("$");
  const [shellSessionId, setShellSessionId] = useState<null | string>(null);
  const [streamState, setStreamState] = useState<StreamState>("ready");
  const stopStream = useRef<null | (() => void)>(null);

  const append = (text: string) => {
    setOutput((current) => `${current}${text}`);
  };

  const run = (preview: string, open: OpenStream, options: RunOptions = {}) => {
    stopStream.current?.();
    setShellSessionId(null);
    setShellPrompt("$");
    setOutput(`${preview}\n\n`);
    setStreamState("running");
    stopStream.current = open({
      onPrompt: setShellPrompt,
      onSession: setShellSessionId,
      onMessage: append,
      onDone: (text, ok) => {
        append(text);
        stopStream.current = null;
        setShellSessionId(null);
        setShellPrompt("$");
        setStreamState(ok ? "done" : "error");
        options.onSettled?.();
      },
      onError: (text) => {
        append(text);
        stopStream.current = null;
        setShellSessionId(null);
        setShellPrompt("$");
        setStreamState("error");
        options.onSettled?.();
      },
    });
  };

  const stop = () => {
    if (shellSessionId) void stopShellSession(shellSessionId);
    stopStream.current?.();
    stopStream.current = null;
    setShellSessionId(null);
    setShellPrompt("$");
    setStreamState("stopped");
    append("\n[stopped]\n");
  };

  const sendInput = (input: string) => {
    if (!shellSessionId) return;
    append(`${shellPrompt}${input}\n`);
    void sendShellInput(shellSessionId, `${input}\n`).catch((error: unknown) => {
      append(`\n${error instanceof Error ? error.message : String(error)}\n`);
      setStreamState("error");
    });
  };

  const clear = () => setOutput(idleOutput);

  return {
    clear,
    inputEnabled: Boolean(shellSessionId && streamState === "running"),
    output,
    prompt: shellPrompt,
    run,
    sendInput,
    stop,
    streamState,
  };
}
