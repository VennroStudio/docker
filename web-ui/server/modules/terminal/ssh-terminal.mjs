import { WebSocketServer } from "ws";

const sshTerminalPath = "/api/terminal/ssh";
const sshTerminalWss = new WebSocketServer({ noServer: true });

sshTerminalWss.on("connection", (ws, req) => {
  void openSshTerminal(ws, req);
});

export function isTerminalUpgrade(req) {
  const url = new URL(req.url, "http://localhost");
  return url.pathname === sshTerminalPath;
}

export function terminalUpgrade(req, socket, head) {
  sshTerminalWss.handleUpgrade(req, socket, head, (ws) => {
    sshTerminalWss.emit("connection", ws, req);
  });
}

async function openSshTerminal(ws, req) {
  let pty;

  try {
    const url = new URL(req.url, "http://localhost");
    const id = validateId(url.searchParams.get("id"));
    const action = validateAction(url.searchParams.get("action"));
    const command = action === "key-push" ? "ssh-key-push" : "ssh-connect";
    const cols = validateDimension(url.searchParams.get("cols"), 120);
    const rows = validateDimension(url.searchParams.get("rows"), 32);
    const ptyModule = await import("node-pty");

    send(ws, {
      data: `$ make ${command} ID=${id}\r\n\r\n`,
      type: "output",
    });

    pty = ptyModule.spawn("make", [command, `ID=${id}`], {
      cols,
      cwd: process.cwd(),
      env: process.env,
      name: "xterm-color",
      rows,
    });
  } catch (error) {
    send(ws, {
      data: `${error instanceof Error ? error.message : String(error)}\r\n`,
      type: "output",
    });
    send(ws, { code: 1, type: "exit" });
    ws.close();
    return;
  }

  pty.onData((data) => send(ws, { data, type: "output" }));
  pty.onExit(({ exitCode }) => {
    send(ws, { code: exitCode, type: "exit" });
    ws.close();
  });

  ws.on("message", (payload) => {
    const message = parseMessage(payload);
    if (!message) return;

    if (message.type === "input") {
      pty.write(String(message.data || ""));
      return;
    }

    if (message.type === "resize") {
      const cols = validateDimension(message.cols, 120);
      const rows = validateDimension(message.rows, 32);
      pty.resize(cols, rows);
    }
  });

  ws.on("close", () => {
    if (pty) pty.kill();
  });
}

function send(ws, payload) {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
}

function parseMessage(payload) {
  try {
    return JSON.parse(payload.toString("utf8"));
  } catch {
    return null;
  }
}

function validateId(value) {
  if (!/^\d+$/.test(String(value || "")) || Number(value) < 1) {
    throw new Error("Invalid SSH server ID");
  }

  return String(value);
}

function validateAction(value) {
  if (!value) return "connect";
  if (value === "connect" || value === "key-push") return value;
  throw new Error("Invalid SSH terminal action");
}

function validateDimension(value, fallback) {
  const dimension = Number(value);
  if (!Number.isInteger(dimension) || dimension < 1 || dimension > 1000) {
    return fallback;
  }

  return dimension;
}
