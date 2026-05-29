export type StreamHandlers = {
  onOpen?: () => void;
  onMessage: (text: string) => void;
  onDone: (text: string, ok: boolean) => void;
  onError: (text: string) => void;
};

export type TerminalRequest = Record<string, boolean | number | string | undefined>;

export type TerminalSession = {
  resize: (cols: number, rows: number) => void;
  send: (input: string) => void;
  stop: () => void;
};

export function openTerminal(request: TerminalRequest, handlers: StreamHandlers): TerminalSession {
  const socket = new WebSocket(terminalUrl());
  let closedByClient = false;
  const pendingMessages: Array<Record<string, number | string>> = [];
  let started = false;

  socket.addEventListener("open", () => {
    started = true;
    handlers.onOpen?.();
    socket.send(JSON.stringify({ request: dropEmptyValues(request), type: "start" }));
    pendingMessages.splice(0).forEach((payload) => socket.send(JSON.stringify(payload)));
  });

  socket.addEventListener("message", (event) => {
    const message = parseTerminalMessage(event);
    if (!message) return;

    if (message.type === "output") {
      handlers.onMessage(message.data);
      return;
    }

    const text = `\r\n[exit ${message.code}]\r\n`;
    handlers.onDone(text, message.code === 0);
  });

  socket.addEventListener("error", () => {
    handlers.onError("Terminal connection error");
  });

  socket.addEventListener("close", () => {
    if (!closedByClient && !started) handlers.onError("Terminal connection closed");
  });

  return {
    resize: (cols: number, rows: number) => {
      send(socket, pendingMessages, { cols, rows, type: "resize" });
    },
    send: (input: string) => {
      send(socket, pendingMessages, { data: input, type: "input" });
    },
    stop: () => {
      closedByClient = true;
      socket.close();
    },
  };
}

function terminalUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return new URL("/api/terminal/run", `${protocol}//${window.location.host}`);
}

function send(socket: WebSocket, pendingMessages: Array<Record<string, number | string>>, payload: Record<string, number | string>) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
    return;
  }

  if (socket.readyState === WebSocket.CONNECTING) pendingMessages.push(payload);
}

function parseTerminalMessage(event: MessageEvent<string>) {
  try {
    return JSON.parse(event.data) as { data: string; type: "output" } | { code: number; type: "exit" };
  } catch {
    return null;
  }
}

function dropEmptyValues(payload: TerminalRequest) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== false && value !== "" && value !== null && value !== undefined,
    ),
  );
}
