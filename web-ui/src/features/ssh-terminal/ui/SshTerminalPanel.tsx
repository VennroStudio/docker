import { useEffect, useRef, useState } from "react";
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
  serverId: number;
  stateLabels: Record<TerminalPanelState, string>;
  title: string;
};

export function SshTerminalPanel({ action, actionLabels, cwd, serverId, stateLabels, title }: SshTerminalPanelProps) {
  const panelRef = useRef<XtermPanelHandle | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<TerminalPanelState>("ready");

  useEffect(() => {
    setState("running");

    const socket = createSshTerminalSocket(serverId, action, 120, 32);
    socketRef.current = socket;

    socket.addEventListener("message", (event) => {
      const message = parseTerminalMessage(event);
      if (!message) return;

      if (message.type === "output") {
        panelRef.current?.write(message.data);
        return;
      }

      panelRef.current?.writeln(`\r\n[exit ${message.code}]`);
      setState(message.code === 0 ? "done" : "error");
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
  }, [action, serverId]);

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
