import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { sse } from "../../command-runner.mjs";
import { assert } from "../../http.mjs";
import { resolveDatabaseShellCommand } from "./instances.mjs";

const sessions = new Map();
const sessionPrefix = "database:";
const promptMarker = "__INFRA_PROMPT__";
const startMarker = "__INFRA_COMMAND_START__";
const endMarker = "__INFRA_COMMAND_END__";

export async function streamDatabaseShell(req, res, container) {
  const [command, args] = await resolveDatabaseShellCommand(container);

  const sessionId = `${sessionPrefix}${randomUUID()}`;
  const child = spawn(command, args, {
    env: { ...process.env, COMPOSE_EXEC_FLAGS: "-i", SHELL_FLAGS: "-i" },
  });
  const session = { buffer: "", child };

  sessions.set(sessionId, session);
  writeShellHeaders(res);
  sse(res, sessionId, "session");

  child.stdout.on("data", (data) => streamShellOutput(res, session, data));
  child.stderr.on("data", (data) => streamShellOutput(res, session, data));

  child.on("error", (error) => {
    sessions.delete(sessionId);
    sse(res, `${error.message}\n`);
    sse(res, "\n[exit 1]\n", "done");
    res.end();
  });

  child.on("close", (code) => {
    sessions.delete(sessionId);
    if (!res.writableEnded) {
      flushBuffer(res, session);
      sse(res, `\n[exit ${code}]\n`, "done");
      res.end();
    }
  });

  req.on("close", () => stopDatabaseShell(sessionId));
  writePromptCommand(child);
}

export function isDatabaseShellSession(sessionId) {
  return typeof sessionId === "string" && sessionId.startsWith(sessionPrefix) && sessions.has(sessionId);
}

export function writeDatabaseShellInput(sessionId, input) {
  const session = sessions.get(sessionId);
  const child = session?.child;

  assert(child && !child.killed && child.stdin.writable, "Shell session is not running");
  child.stdin.write(
    `printf '${startMarker}\\n'\n${input.trimEnd()}\n__infra_status=$?\nprintf '${endMarker}=%s\\n' "$__infra_status"\n`,
  );
  writePromptCommand(child);
}

export function stopDatabaseShell(sessionId) {
  const child = sessions.get(sessionId)?.child;
  if (!child) return;

  sessions.delete(sessionId);
  if (child.stdin.writable) child.stdin.end("exit\n");
  if (!child.killed) child.kill("SIGTERM");
}

function streamShellOutput(res, session, value) {
  session.buffer += cleanTerminalOutput(value);

  const lines = session.buffer.split("\n");
  session.buffer = lines.pop() || "";

  for (const line of lines) handleShellLine(res, line);
}

function flushBuffer(res, session) {
  if (!session.buffer) return;
  handleShellLine(res, session.buffer);
  session.buffer = "";
}

function handleShellLine(res, line) {
  if (line === startMarker) return;
  if (line.startsWith(`${endMarker}=`)) return;

  if (line.startsWith(`${promptMarker}=`)) {
    sse(res, line.slice(promptMarker.length + 1), "prompt");
    return;
  }

  sse(res, `${line}\n`);
}

function writePromptCommand(child) {
  child.stdin.write(`printf '${promptMarker}=%s@%s:%s# \\n' "$(id -un 2>/dev/null || whoami)" "$(hostname)" "$PWD"\n`);
}

function cleanTerminalOutput(value) {
  return String(value).replace(/\r/g, "");
}

function writeShellHeaders(res) {
  res.writeHead(200, {
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream; charset=utf-8",
    "X-Accel-Buffering": "no",
  });
}
