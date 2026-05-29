import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { BrushCleaning, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { StreamState } from "@/entities/infrastructure";
import { cn } from "@/shared/lib";
import { Button } from "@/shared/ui";
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
  stateLabels: Record<StreamState, string>;
  title: string;
};

export function SshTerminalPanel({ action, actionLabels, cwd, serverId, stateLabels, title }: SshTerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const [state, setState] = useState<StreamState>("ready");

  useEffect(() => {
    if (!containerRef.current) return;

    const terminal = new XTerm({
      allowProposedApi: false,
      convertEol: true,
      cursorBlink: true,
      cursorStyle: "block",
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
    fit.fit();
    terminal.focus();

    terminalRef.current = terminal;
    fitRef.current = fit;
    setState("running");

    const socket = createSshTerminalSocket(serverId, action, terminal.cols, terminal.rows);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      sendTerminalResize(socket, terminal.cols, terminal.rows);
    });
    socket.addEventListener("message", (event) => {
      const message = parseTerminalMessage(event);
      if (!message) return;

      if (message.type === "output") {
        terminal.write(message.data);
        return;
      }

      terminal.writeln(`\r\n[exit ${message.code}]`);
      setState(message.code === 0 ? "done" : "error");
    });
    socket.addEventListener("close", () => {
      setState((current) => (current === "running" ? "stopped" : current));
    });
    socket.addEventListener("error", () => {
      terminal.writeln("\r\n[terminal connection error]");
      setState("error");
    });

    const inputDisposable = terminal.onData((data) => sendTerminalInput(socket, data));
    const resizeObserver = new ResizeObserver(() => {
      fit.fit();
      sendTerminalResize(socket, terminal.cols, terminal.rows);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      inputDisposable.dispose();
      resizeObserver.disconnect();
      socket.close();
      terminal.dispose();
      socketRef.current = null;
      terminalRef.current = null;
      fitRef.current = null;
    };
  }, [action, serverId]);

  const clear = () => terminalRef.current?.clear();
  const stop = () => {
    socketRef.current?.close();
    setState("stopped");
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
            onClick={stop}
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
      <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden p-3" />
    </section>
  );
}

function terminalStateClass(state: StreamState) {
  return {
    done: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    error: "border-red-300/30 bg-red-500/10 text-red-100",
    ready: "border-zinc-700/80 bg-zinc-900 text-zinc-400",
    running: "border-teal-300/30 bg-teal-400/10 text-teal-100",
    stopped: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  }[state];
}
