import { projectRoot, terminalSessionLimit } from "../../config.mjs";
import { parseTerminalMessage, sendTerminalMessage, validateDimension } from "./protocol.mjs";

let activeSessions = 0;

export async function startPtySession(ws, options) {
  if (activeSessions >= terminalSessionLimit) {
    throw new Error(`Terminal session limit reached (${terminalSessionLimit})`);
  }

  let ended = false;
  const ptyModule = await import("node-pty");
  activeSessions += 1;

  const pty = ptyModule.spawn(options.command, options.args, {
    cols: options.cols,
    cwd: options.cwd || projectRoot,
    env: options.env || process.env,
    name: "xterm-color",
    rows: options.rows,
  });

  const finish = () => {
    if (ended) return;
    ended = true;
    activeSessions = Math.max(0, activeSessions - 1);
  };

  pty.onData((data) => sendTerminalMessage(ws, { data, type: "output" }));
  pty.onExit(({ exitCode }) => {
    finish();
    sendTerminalMessage(ws, { code: exitCode, type: "exit" });
    ws.close();
  });
  ws.on("close", () => {
    finish();
    pty.kill();
  });

  return pty;
}

export function attachPtyControls(ws, getPty, getSize, setSize) {
  ws.on("message", (payload) => {
    const message = parseTerminalMessage(payload);
    if (!message) return;

    if (message.type === "input") {
      getPty()?.write(String(message.data || ""));
      return;
    }

    if (message.type === "resize") {
      const current = getSize();
      const cols = validateDimension(message.cols, current.cols);
      const rows = validateDimension(message.rows, current.rows);
      setSize({ cols, rows });
      getPty()?.resize(cols, rows);
    }
  });
}
