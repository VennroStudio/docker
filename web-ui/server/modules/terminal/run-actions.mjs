import { commandMap } from "../../config.mjs";
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

export async function resolveTerminalRequest(request) {
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
    case "project-action":
      return projectActionCommand(request);
    case "project-create":
      return projectCreateCommand(request);
    case "project-remove":
      return ["make", ["project-remove", `NAME=${validateProjectName(request.name)}`, "FORCE=1"]];
    case "project-shell":
      return ["make", ["project-shell", `NAME=${validateProjectName(request.name)}`]];
    case "project-update":
      return projectUpdateCommand(request);
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
    case "ssh-command-add":
      return [
        "make",
        [
          "ssh-command-add",
          `SERVER_ID=${validateId(request.serverId)}`,
          valueArg("COMMAND", validateCommandText(request.command)),
        ],
      ];
    case "ssh-command-remove":
      return ["make", ["ssh-command-remove", `ID=${validateId(request.id)}`]];
    case "ssh-command-update":
      return [
        "make",
        [
          "ssh-command-update",
          `ID=${validateId(request.id)}`,
          valueArg("COMMAND", validateCommandText(request.command)),
        ],
      ];
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

function projectActionCommand(request) {
  const action = validateEnum(
    request.action,
    ["build", "clean", "down", "logs", "logs-follow", "start", "status", "stop", "up"],
    "Invalid project action",
  );
  return ["make", [`project-${action}`, `NAME=${validateProjectName(request.name)}`]];
}

function projectCreateCommand(request) {
  return ["make", ["project-create", ...projectArgs(request)]];
}

function projectUpdateCommand(request) {
  return ["make", ["project-update", ...projectArgs(request)]];
}

function projectArgs(payload) {
  const args = [
    valueArg("NAME", validateProjectName(payload.name)),
    valueArg(
      "WEB_STACK",
      validateEnum(payload.webStack || "nginx", ["apache", "nginx", "node"], "Invalid WEB_STACK"),
    ),
  ];

  if (payload.documentRoot)
    args.push(valueArg("DOCUMENT_ROOT", validateProjectPath(payload.documentRoot, "Invalid DOCUMENT_ROOT")));
  if (payload.webPort) args.push(valueArg("WEB_PORT", validateProjectPort(payload.webPort)));
  if (payload.webStack === "node" && payload.webCommand)
    args.push(valueArg("WEB_COMMAND", validateCommandText(payload.webCommand)));
  if (payload.phpVersion)
    args.push(valueArg("PHP_VERSION", validateVersion(payload.phpVersion, "Invalid PHP_VERSION")));
  if (payload.enableNode || payload.webStack === "node") {
    if (payload.nodeVersion)
      args.push(valueArg("NODE_VERSION", validateVersion(payload.nodeVersion, "Invalid NODE_VERSION")));
    if (payload.nodePackageManager) {
      args.push(
        valueArg(
          "NODE_PACKAGE_MANAGER",
          validateEnum(payload.nodePackageManager, ["npm", "pnpm", "yarn"], "Invalid NODE_PACKAGE_MANAGER"),
        ),
      );
    }
  } else if (payload.removeNode) {
    args.push("REMOVE_RUNTIMES=node");
  }

  return args;
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

function validateCommandText(value) {
  const command = validateText(value, "COMMAND is required");
  assert(!command.includes("\0"), "Invalid COMMAND");
  return command;
}

function validateProjectName(value) {
  assert(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value || ""), "Invalid project NAME");
  return value;
}

function validateProjectPath(value, message) {
  const path = validateText(value, message);
  assert(!path.includes("..") && !path.startsWith("/") && !path.includes("\0"), message);
  return path;
}

function validateProjectPort(value) {
  validatePort(value);
  return String(value);
}

function validateVersion(value, message) {
  assert(/^[A-Za-z0-9_.-]+$/.test(value || ""), message);
  return value;
}

function validateEnum(value, allowed, message) {
  assert(allowed.includes(value), message);
  return value;
}

function isTruthy(value) {
  return value === true || value === "1" || value === "true" || value === "on";
}
