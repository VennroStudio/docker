export type SshTerminalMessage = { data: string; type: "output" } | { code: number; type: "exit" };

export type SshTerminalAction = "connect" | "key-push";

export function createSshTerminalSocket(serverId: number, action: SshTerminalAction, cols: number, rows: number) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const url = new URL("/api/terminal/ssh", `${protocol}//${window.location.host}`);

  url.searchParams.set("id", String(serverId));
  url.searchParams.set("action", action);
  url.searchParams.set("cols", String(cols));
  url.searchParams.set("rows", String(rows));

  return new WebSocket(url);
}

export function sendTerminalInput(socket: WebSocket, data: string) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ data, type: "input" }));
}

export function sendTerminalResize(socket: WebSocket, cols: number, rows: number) {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ cols, rows, type: "resize" }));
}

export function parseTerminalMessage(payload: MessageEvent<string>): SshTerminalMessage | null {
  try {
    return JSON.parse(payload.data) as SshTerminalMessage;
  } catch {
    return null;
  }
}
