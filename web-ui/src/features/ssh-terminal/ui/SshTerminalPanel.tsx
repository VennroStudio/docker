import { useCallback, useEffect, useRef, useState } from "react";
import { XtermPanel, type TerminalPanelState, type XtermPanelHandle } from "@/shared/ui";
import {
  createSshTerminalSocket,
  parseTerminalMessage,
  sendTerminalInput,
  sendTerminalResize,
  type SshTerminalAction,
} from "../api/sshTerminalSocket";

type SshTerminalPanelProps = {
  actionLabels: {
    clear: string;
    stop: string;
  };
  action: SshTerminalAction;
  cwd: string;
  input?: {
    data: string;
    id: number;
  };
  serverId: number;
  stateLabels: Record<TerminalPanelState, string>;
  title: string;
  onExit?: (code: number) => void;
};

export function SshTerminalPanel({
  action,
  actionLabels,
  cwd,
  input,
  serverId,
  stateLabels,
  title,
  onExit,
}: SshTerminalPanelProps) {
  const lastInputIdRef = useRef<number | null>(null);
  const onExitRef = useRef(onExit);
  const panelRef = useRef<XtermPanelHandle | null>(null);
  const pendingInputRef = useRef<null | string>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<TerminalPanelState>("running");

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  const flushPendingInput = useCallback(() => {
    const inputData = pendingInputRef.current;
    const socket = socketRef.current;
    if (!inputData || !socket || socket.readyState !== WebSocket.OPEN) return;

    sendTerminalInput(socket, inputData);
    pendingInputRef.current = null;
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const socket = createSshTerminalSocket(serverId, action, 120, 32);
    socketRef.current = socket;

    socket.addEventListener("open", flushPendingInput);
    socket.addEventListener("message", (event) => {
      const message = parseTerminalMessage(event);
      if (!message) return;

      if (message.type === "output") {
        panelRef.current?.write(message.data);
        return;
      }

      panelRef.current?.writeln(`\r\n[exit ${message.code}]`);
      setState(message.code === 0 ? "done" : "error");
      onExitRef.current?.(message.code);
    });
    socket.addEventListener("close", () => {
      setState((current) => (current === "running" ? "stopped" : current));
    });
    socket.addEventListener("error", () => {
      panelRef.current?.writeln("\r\n[terminal connection error]");
      setState("error");
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [action, flushPendingInput, serverId]);

  useEffect(() => {
    if (!input || input.id === lastInputIdRef.current) return;
    lastInputIdRef.current = input.id;
    pendingInputRef.current = input.data;
    flushPendingInput();
  }, [flushPendingInput, input]);

  const sendInput = (data: string) => {
    if (socketRef.current) sendTerminalInput(socketRef.current, data);
  };
  const resize = (cols: number, rows: number) => {
    if (socketRef.current) sendTerminalResize(socketRef.current, cols, rows);
  };
  const stop = () => {
    socketRef.current?.close();
    setState("stopped");
  };

  return (
    <XtermPanel
      ref={panelRef}
      actionLabels={actionLabels}
      cwd={cwd}
      inputEnabled={state === "running"}
      state={state}
      stateLabels={stateLabels}
      title={title}
      onInput={sendInput}
      onResize={resize}
      onStop={stop}
    />
  );
}
