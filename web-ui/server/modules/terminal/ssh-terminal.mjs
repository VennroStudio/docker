import { WebSocketServer } from "ws";
import { projectRoot } from "../../config.mjs";
import { sendTerminalMessage, validateDimension } from "./protocol.mjs";
import { attachPtyControls, startPtySession } from "./pty-session.mjs";

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
  let pty = null;
  let size = readTerminalSize(req);

  attachPtyControls(
    ws,
    () => pty,
    () => size,
    (nextSize) => {
      size = nextSize;
    },
  );

  try {
    const url = new URL(req.url, "http://localhost");
    const id = validateId(url.searchParams.get("id"));
    const action = validateAction(url.searchParams.get("action"));
    const command = {
      connect: "ssh-connect",
      "key-push": "ssh-key-push",
      "key-remove": "ssh-key-remove",
    }[action];

    sendTerminalMessage(ws, {
      data: `$ make ${command} ID=${id}\r\n\r\n`,
      type: "output",
    });

    pty = await startPtySession(ws, {
      args: [command, `ID=${id}`],
      cols: size.cols,
      command: "make",
      cwd: projectRoot,
      rows: size.rows,
    });
  } catch (error) {
    sendTerminalMessage(ws, {
      data: `${error instanceof Error ? error.message : String(error)}\r\n`,
      type: "output",
    });
    sendTerminalMessage(ws, { code: 1, type: "exit" });
    ws.close();
  }
}

function readTerminalSize(req) {
  const params = new URL(req.url, "http://localhost").searchParams;
  return {
    cols: validateDimension(params.get("cols"), 120),
    rows: validateDimension(params.get("rows"), 32),
  };
}

function validateId(value) {
  if (!/^\d+$/.test(String(value || "")) || Number(value) < 1) {
    throw new Error("Invalid SSH server ID");
  }

  return String(value);
}

function validateAction(value) {
  if (!value) return "connect";
  if (value === "connect" || value === "key-push" || value === "key-remove")
    return value;
  throw new Error("Invalid SSH terminal action");
}
