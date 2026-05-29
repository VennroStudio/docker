import { WebSocketServer } from "ws";
import { commandMap, projectRoot } from "../../config.mjs";
import { assert, validateDomain, validatePort, validateTarget } from "../../http.mjs";
import {
  mariaDbDatabaseCommand,
  mariaDbExportCommand,
  mariaDbImportCommand,
  mariaDbInstanceActionCommand,
  mariaDbInstanceCreateCommand,
  postgresDatabaseCommand,
  postgresExportCommand,
  postgresImportCommand,
  postgresInstanceActionCommand,
  postgresInstanceCreateCommand,
} from "../database/commands.mjs";
import { resolveDatabaseShellCommand } from "../database/instances.mjs";
import {
  validateInstanceAction,
  validateMariaDbCreateForm,
  validateMariaDbDatabaseForm,
  validateMariaDbDumpForm,
  validateMariaDbInstanceName,
  validatePostgresCreateForm,
  validatePostgresDatabaseForm,
  validatePostgresDumpForm,
  validatePostgresInstanceName,
} from "../database/validators.mjs";
import { hostCommand, proxyCommand, proxyDeleteCommand } from "../nginx/commands.mjs";

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
  let cols = validateDimension(new URL(req.url, "http://localhost").searchParams.get("cols"), 120);
  let rows = validateDimension(new URL(req.url, "http://localhost").searchParams.get("rows"), 32);
  let pty = null;
  let started = false;

  ws.on("message", async (payload) => {
    const message = parseMessage(payload);
    if (!message) return;

    if (message.type === "resize") {
      cols = validateDimension(message.cols, cols);
      rows = validateDimension(message.rows, rows);
      if (pty) pty.resize(cols, rows);
      return;
    }

    if (message.type === "input") {
      if (pty) pty.write(String(message.data || ""));
      return;
    }

    if (message.type !== "start" || started) return;
    started = true;

    try {
      const [command, args, env] = await resolveTerminalRequest(message.request);
      const ptyModule = await import("node-pty");

      pty = ptyModule.spawn(command, args, {
        cols,
        cwd: projectRoot,
        env: env || process.env,
        name: "xterm-color",
        rows,
      });

      pty.onData((data) => send(ws, { data, type: "output" }));
      pty.onExit(({ exitCode }) => {
        send(ws, { code: exitCode, type: "exit" });
        ws.close();
      });
    } catch (error) {
      send(ws, {
        data: `${error instanceof Error ? error.message : String(error)}\r\n`,
        type: "output",
      });
      send(ws, { code: 1, type: "exit" });
      ws.close();
    }
  });

  ws.on("close", () => {
    if (pty) pty.kill();
  });
}

async function resolveTerminalRequest(request) {
  assert(request && typeof request === "object", "Invalid terminal request");

  switch (request.type) {
    case "archive-create":
      return ["make", ["archive", `NAME=${validateArchiveBaseName(request.name)}`, pathArg("FOLDER", request.folder)]];
    case "archive-delete":
      return ["make", ["archive-delete", `NAME=${validateArchiveFileName(request.name)}`]];
    case "archive-extract":
      return ["make", ["unarchive", `NAME=${validateArchiveFileName(request.name)}`, pathArg("DEST", request.dest)]];
    case "command":
      return resolveManifestCommand(request.command);
    case "host":
      return resolveHostCommand(request);
    case "mariadb-database":
      return mariaDbDatabaseCommand(await validateMariaDbDatabaseForm(param(request)));
    case "mariadb-export":
      return mariaDbExportCommand(await validateMariaDbDumpForm(param(request)));
    case "mariadb-import":
      return mariaDbImportCommand(await validateMariaDbDumpForm(param(request)));
    case "mariadb-instance":
      return resolveMariaDbInstanceCommand(request);
    case "mariadb-instance-add":
      return mariaDbInstanceCreateCommand(validateMariaDbCreateForm(param(request)));
    case "postgres-database":
      return postgresDatabaseCommand(await validatePostgresDatabaseForm(param(request)));
    case "postgres-export":
      return postgresExportCommand(await validatePostgresDumpForm(param(request)));
    case "postgres-import":
      return postgresImportCommand(await validatePostgresDumpForm(param(request)));
    case "postgres-instance":
      return resolvePostgresInstanceCommand(request);
    case "postgres-instance-add":
      return postgresInstanceCreateCommand(validatePostgresCreateForm(param(request)));
    case "proxy":
      return resolveProxyCommand(request);
    case "proxy-delete":
      return resolveProxyDeleteCommand(request);
    case "shell":
      return resolveShellCommand(request.container);
    case "ssh-add":
      return ["make", ["ssh-add", ...serverArgs(request)]];
    case "ssh-key-generate":
      return ["make", ["ssh-key-generate", `ID=${validateId(request.id)}`, ...keyArgs(request)]];
    case "ssh-remove":
      return ["make", ["ssh-remove", `ID=${validateId(request.id)}`]];
    case "ssh-update":
      return ["make", ["ssh-update", `ID=${validateId(request.id)}`, ...serverArgs(request)]];
    default:
      throw new Error("Unknown terminal request");
  }
}

function resolveManifestCommand(commandId) {
  assert(typeof commandId === "string", "Invalid command");
  const entry = commandMap[commandId];
  assert(entry, "Unknown command");
  return [entry[0], entry.slice(1)];
}

function resolveHostCommand(request) {
  assert(request.action === "add" || request.action === "remove", "Invalid host action");
  validateDomain(request.domain);
  return hostCommand(request.action, request.domain);
}

function resolveProxyCommand(request) {
  validateDomain(request.domain);
  validateTarget(request.target);
  validatePort(request.port);
  return proxyCommand({
    domain: request.domain,
    port: request.port,
    ssl: isTruthy(request.ssl),
    target: request.target,
  });
}

function resolveProxyDeleteCommand(request) {
  validateDomain(request.domain);
  return proxyDeleteCommand(request.domain);
}

async function resolveShellCommand(container) {
  if (container === "nginx-container") return ["make", ["npm-shell"]];
  if (container === "redis-container") return ["make", ["redis-shell"]];
  if (container === "redisinsight-container") return ["make", ["redisinsight-shell"]];
  if (container === "minio-container") return ["make", ["minio-shell"]];
  if (container === "registry-container") return ["make", ["registry-shell"]];
  if (container === "registry-ui-container") return ["make", ["registry-ui-shell"]];
  return resolveDatabaseShellCommand(container);
}

function resolveMariaDbInstanceCommand(request) {
  validateInstanceAction(request.action);
  validateMariaDbInstanceName(request.name);
  return mariaDbInstanceActionCommand(request.name, request.action);
}

function resolvePostgresInstanceCommand(request) {
  validateInstanceAction(request.action);
  validatePostgresInstanceName(request.name);
  return postgresInstanceActionCommand(request.name, request.action);
}

function serverArgs(payload) {
  return [
    valueArg("NAME", validateText(payload.name, "NAME is required")),
    valueArg("HOST", validateHost(payload.host)),
    valueArg("PORT", validateSshPort(payload.port || "22")),
    valueArg("USER", validateText(payload.user, "USER is required")),
    valueArg("AUTH_TYPE", validateEnum(payload.authType || "password", ["password", "key"], "Invalid AUTH_TYPE")),
    valueArg(
      "PASSWORD_MODE",
      validateEnum(payload.passwordMode || "manual", ["manual", "sshpass"], "Invalid PASSWORD_MODE"),
    ),
    valueArg("PASSWORD", payload.password || ""),
    valueArg("KEY_PATH", payload.keyPath || ""),
  ];
}

function keyArgs(payload) {
  return [
    payload.keyPath ? valueArg("KEY_PATH", payload.keyPath) : null,
    payload.comment ? valueArg("COMMENT", payload.comment) : null,
    payload.force ? "FORCE=1" : null,
  ].filter(Boolean);
}

function param(payload) {
  return (key) => payload?.[key];
}

function pathArg(key, value) {
  return `${key}=${validatePathValue(value, `${key} is required`)}`;
}

function valueArg(key, value) {
  return `${key}=${String(value ?? "")}`;
}

function validateArchiveBaseName(value) {
  assert(/^[A-Za-z0-9._-]+$/.test(value || ""), "Invalid NAME");
  return value;
}

function validateArchiveFileName(value) {
  assert(/^[A-Za-z0-9._-]+\.t(ar\.)?gz$/.test(value || ""), "Invalid NAME");
  return value;
}

function validatePathValue(value, message) {
  assert(typeof value === "string" && value.trim(), message);
  return value.trim();
}

function validateId(value) {
  assert(/^\d+$/.test(String(value || "")) && Number(value) > 0, "Invalid ID");
  return String(value);
}

function validateSshPort(value) {
  assert(/^\d+$/.test(String(value || "")), "Invalid PORT");
  const port = Number(value);
  assert(port >= 1 && port <= 65535, "Invalid PORT");
  return String(port);
}

function validateHost(value) {
  const host = validateText(value, "HOST is required");
  assert(!/\s/.test(host), "HOST must not contain whitespace");
  return host;
}

function validateText(value, message) {
  assert(typeof value === "string" && value.trim(), message);
  return value.trim();
}

function validateEnum(value, allowed, message) {
  assert(allowed.includes(value), message);
  return value;
}

function isTruthy(value) {
  return value === true || value === "1" || value === "true" || value === "on";
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

function validateDimension(value, fallback) {
  const dimension = Number(value);
  if (!Number.isInteger(dimension) || dimension < 1 || dimension > 1000) {
    return fallback;
  }

  return dimension;
}
