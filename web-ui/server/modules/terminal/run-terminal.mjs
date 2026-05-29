import { WebSocketServer } from "ws";
import { parseTerminalMessage, sendTerminalMessage, validateDimension } from "./protocol.mjs";
import { attachPtyControls, startPtySession } from "./pty-session.mjs";
import { resolveTerminalRequest } from "./run-actions.mjs";

const runTerminalPath = "/api/terminal/run";
const runTerminalWss = new WebSocketServer({ noServer: true });

runTerminalWss.on("connection", (ws, req) => {
  void openRunTerminal(ws, req);
});

export function isRunTerminalUpgrade(req) {
  const url = new URL(req.url, "http://localhost");
  return url.pathname === runTerminalPath;
}

export function runTerminalUpgrade(req, socket, head) {
  runTerminalWss.handleUpgrade(req, socket, head, (ws) => {
    runTerminalWss.emit("connection", ws, req);
  });
}

async function openRunTerminal(ws, req) {
  let size = readTerminalSize(req);
  let pty = null;
  let started = false;

  attachPtyControls(
    ws,
    () => pty,
    () => size,
    (nextSize) => {
      size = nextSize;
    },
  );

  ws.on("message", async (payload) => {
    const message = parseTerminalMessage(payload);
    if (!message || message.type !== "start" || started) return;

    started = true;

    try {
      const [command, args, env] = await resolveTerminalRequest(message.request);
      pty = await startPtySession(ws, {
        args,
        cols: size.cols,
        command,
        env,
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
  });
}

function readTerminalSize(req) {
  const params = new URL(req.url, "http://localhost").searchParams;
  return {
    cols: validateDimension(params.get("cols"), 120),
    rows: validateDimension(params.get("rows"), 32),
  };
}
