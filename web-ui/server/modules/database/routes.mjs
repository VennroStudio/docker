import { streamSse } from "../../command-runner.mjs";
import { commandMap } from "../../config.mjs";
import { assert, body, sendJson, validatePort } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import {
  mariaDbDatabaseCommand,
  mariaDbDatabaseListCommand,
  mariaDbDumpListCommand,
  mariaDbExportCommand,
  mariaDbImportCommand,
  mariaDbInstanceActionCommand,
  mariaDbInstanceCreateCommand,
  postgresDatabaseCommand,
  postgresDatabaseListCommand,
  postgresDumpListCommand,
  postgresExportCommand,
  postgresImportCommand,
  postgresInstanceActionCommand,
  postgresInstanceCreateCommand,
} from "./commands.mjs";
import {
  isPotentialDatabaseShellContainer,
  resolveMariaDbInstanceByContainer,
  resolvePostgresInstanceByContainer,
  validateContainerName,
  validateInstanceName,
} from "./instances.mjs";
import { streamDatabaseShell } from "./shell.mjs";

const databaseCommandPrefixes = ["phpmyadmin:", "pgadmin:", "postgres:"];
const instanceActions = new Set(["clean", "down", "logs", "start", "stop", "up"]);

export function isDatabaseStreamRoute(req) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") return isDatabaseCommand(url.searchParams.get("command"));
  if (url.pathname === "/api/stream/shell") return isPotentialDatabaseShellContainer(url.searchParams.get("container"));
  return [
    "/api/stream/mariadb-database",
    "/api/stream/mariadb-export",
    "/api/stream/mariadb-import",
    "/api/stream/mariadb-instance",
    "/api/stream/mariadb-instance-add",
    "/api/stream/postgres-database",
    "/api/stream/postgres-export",
    "/api/stream/postgres-import",
    "/api/stream/postgres-instance",
    "/api/stream/postgres-instance-add",
  ].includes(url.pathname);
}

export async function databaseStreamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");
  const payload = req.method === "POST" ? await body(req) : null;
  const param = (key) => payload?.[key] ?? url.searchParams.get(key);

  if (url.pathname === "/api/stream/run") {
    const commandId = param("command");
    assert(isDatabaseCommand(commandId), "Unknown database command");
    const entry = commandMap[commandId];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1), process.env);
  }

  if (url.pathname === "/api/stream/shell") {
    return await streamDatabaseShell(req, res, param("container"));
  }

  if (url.pathname === "/api/stream/mariadb-instance-add") {
    const command = mariaDbInstanceCreateCommand(validateMariaDbCreateForm(param));
    return streamSse(req, res, command[0], command[1], process.env);
  }

  if (url.pathname === "/api/stream/mariadb-instance") {
    const name = param("name");
    const action = param("action");
    validateInstanceAction(action);
    validateInstanceName(name, "MariaDB");
    const [command, args] = mariaDbInstanceActionCommand(name, action);
    return streamSse(req, res, command, args, process.env);
  }

  if (url.pathname === "/api/stream/mariadb-import" || url.pathname === "/api/stream/mariadb-export") {
    const form = await validateMariaDbDumpForm(param);
    const [command, args] =
      url.pathname.endsWith("import") ? mariaDbImportCommand(form) : mariaDbExportCommand(form);
    return streamSse(req, res, command, args, process.env);
  }

  if (url.pathname === "/api/stream/mariadb-database") {
    const form = await validateMariaDbDatabaseForm(param);
    const [command, args] = mariaDbDatabaseCommand(form);
    return streamSse(req, res, command, args, process.env);
  }

  if (url.pathname === "/api/stream/postgres-instance-add") {
    const command = postgresInstanceCreateCommand(validatePostgresCreateForm(param));
    return streamSse(req, res, command[0], command[1], process.env);
  }

  if (url.pathname === "/api/stream/postgres-instance") {
    const name = param("name");
    const action = param("action");
    validateInstanceAction(action);
    validateInstanceName(name, "Postgres");
    const [command, args] = postgresInstanceActionCommand(name, action);
    return streamSse(req, res, command, args, process.env);
  }

  if (url.pathname === "/api/stream/postgres-import" || url.pathname === "/api/stream/postgres-export") {
    const form = await validatePostgresDumpForm(param);
    const [command, args] =
      url.pathname.endsWith("import") ? postgresImportCommand(form) : postgresExportCommand(form);
    return streamSse(req, res, command, args, process.env);
  }

  if (url.pathname === "/api/stream/postgres-database") {
    const form = await validatePostgresDatabaseForm(param);
    const [command, args] = postgresDatabaseCommand(form);
    return streamSse(req, res, command, args, process.env);
  }

  throw new Error("Unknown database stream route");
}

export async function mariadbInstances(_req, res) {
  sendJson(res, 200, parseJsonOutput(await execMake(["mariadb-status"])));
}

export async function postgresInstances(_req, res) {
  sendJson(res, 200, parseJsonOutput(await execMake(["postgres-status"])));
}

export async function databases(req, res) {
  const url = new URL(req.url, "http://localhost");
  const engine = url.searchParams.get("engine") || "mariadb";
  const container = url.searchParams.get("container") || "";

  const [_command, args] = await databaseListCommand({ container, engine });
  const output = await execMake(args);

  sendJson(res, 200, {
    databases: output
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean),
  });
}

async function databaseListCommand({ container, engine }) {
  validateContainerName(container);
  assert(engine === "mariadb" || engine === "postgres", "Unknown database engine");

  if (engine === "mariadb") {
    await resolveMariaDbInstanceByContainer(container);
    return mariaDbDatabaseListCommand({ container });
  }

  await resolvePostgresInstanceByContainer(container);
  return postgresDatabaseListCommand({ container });
}

export async function dumps(req, res) {
  const url = new URL(req.url, "http://localhost");
  const engine = url.searchParams.get("engine") || "mariadb";
  const [_command, args] = dumpListCommand(engine);
  sendJson(res, 200, parseJsonOutput(await execMake(args)));
}

function validateMariaDbCreateForm(param) {
  const form = {
    authMode: param("authMode") || "config",
    password: param("password"),
    port: param("port"),
    rootPassword: param("rootPassword"),
    user: param("user"),
    version: param("version"),
  };

  assert(/^\d+(\.\d+){1,2}$/.test(form.version || ""), "Invalid MariaDB version");
  assert(form.user, "MariaDB user is required");
  assert(form.password, "MariaDB password is required");
  assert(form.rootPassword, "MariaDB root password is required");
  assert(form.authMode === "config" || form.authMode === "cookie", "Invalid phpMyAdmin auth mode");
  if (form.port) validatePort(form.port);
  return form;
}

function validatePostgresCreateForm(param) {
  const form = {
    database: param("database"),
    password: param("password"),
    port: param("port"),
    user: param("user"),
    version: param("version"),
  };

  assert(/^\d+(\.\d+)?$/.test(form.version || ""), "Invalid Postgres version");
  assert(/^[A-Za-z0-9_]+$/.test(form.user || ""), "Invalid Postgres user");
  assert(form.password, "Postgres password is required");
  validatePostgresDatabaseName(form.database);
  if (form.port) validatePort(form.port);
  return form;
}

async function validateMariaDbDumpForm(param) {
  const form = await validateMariaDbTargetForm(param);
  form.filePath = param("filePath");
  validateDumpFilePath(form.filePath, ["sql", "sql.gz"]);
  return form;
}

async function validatePostgresDumpForm(param) {
  const form = await validatePostgresTargetForm(param);
  form.filePath = param("filePath");
  validateDumpFilePath(form.filePath, ["sql", "sql.gz", "dump"]);
  return form;
}

async function validateMariaDbDatabaseForm(param) {
  const form = {
    action: param("action"),
    container: param("container"),
    database: param("database"),
  };

  validateDatabaseAction(form.action);
  await resolveMariaDbInstanceByContainer(form.container);
  validateMariaDbDatabaseName(form.database);
  return form;
}

async function validateMariaDbTargetForm(param) {
  const form = {
    container: param("container"),
    database: param("database"),
  };

  await resolveMariaDbInstanceByContainer(form.container);
  validateMariaDbDatabaseName(form.database);
  return form;
}

async function validatePostgresDatabaseForm(param) {
  const form = {
    action: param("action"),
    container: param("container"),
    database: param("database"),
  };

  validateDatabaseAction(form.action);
  await resolvePostgresInstanceByContainer(form.container);
  validatePostgresDatabaseName(form.database);
  return form;
}

async function validatePostgresTargetForm(param) {
  const form = {
    container: param("container"),
    database: param("database"),
  };

  await resolvePostgresInstanceByContainer(form.container);
  validatePostgresDatabaseName(form.database);
  return form;
}

function validateInstanceAction(action) {
  assert(instanceActions.has(action), "Invalid database instance action");
}

function validateDatabaseAction(action) {
  assert(action === "create" || action === "drop", "Invalid database action");
}

function validateMariaDbDatabaseName(database) {
  assert(/^[A-Za-z0-9_$.-]+$/.test(database || ""), "Invalid database name");
}

function validatePostgresDatabaseName(database) {
  assert(/^[A-Za-z0-9_]+$/.test(database || ""), "Invalid Postgres database name");
}

function parseJsonOutput(output) {
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`Command returned invalid JSON: ${output}`);
  }
}

function validateDumpFilePath(filePath, extensions) {
  assert(filePath, "Dump file path is required");
  assert(!/[\0\r\n]/.test(filePath), "Invalid dump file path");
  assert(extensions.some((extension) => String(filePath).endsWith(`.${extension}`)), "Invalid dump file extension");
}

function dumpListCommand(engine) {
  assert(engine === "mariadb" || engine === "postgres", "Unknown dump engine");
  return engine === "mariadb" ? mariaDbDumpListCommand() : postgresDumpListCommand();
}

function isDatabaseCommand(commandId) {
  return typeof commandId === "string" && databaseCommandPrefixes.some((prefix) => commandId.startsWith(prefix));
}
