import { assert, validatePort } from "../../http.mjs";
import {
  resolveMariaDbInstanceByContainer,
  resolvePostgresInstanceByContainer,
  validateInstanceName,
} from "./instances.mjs";

const instanceActions = new Set(["clean", "down", "logs", "start", "stop", "up"]);

export function validateInstanceAction(action) {
  assert(instanceActions.has(action), "Invalid database instance action");
}

export function validateDatabaseAction(action) {
  assert(action === "create" || action === "drop", "Invalid database action");
}

export function validateMariaDbCreateForm(param) {
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

export function validatePostgresCreateForm(param) {
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

export async function validateMariaDbDumpForm(param) {
  const form = await validateMariaDbTargetForm(param);
  form.filePath = param("filePath");
  validateDumpFilePath(form.filePath, ["sql", "sql.gz"]);
  return form;
}

export async function validatePostgresDumpForm(param) {
  const form = await validatePostgresTargetForm(param);
  form.filePath = param("filePath");
  validateDumpFilePath(form.filePath, ["sql", "sql.gz", "dump"]);
  return form;
}

export async function validateMariaDbDatabaseForm(param) {
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

export async function validatePostgresDatabaseForm(param) {
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

export async function validateMariaDbTargetForm(param) {
  const form = {
    container: param("container"),
    database: param("database"),
  };

  await resolveMariaDbInstanceByContainer(form.container);
  validateMariaDbDatabaseName(form.database);
  return form;
}

export async function validatePostgresTargetForm(param) {
  const form = {
    container: param("container"),
    database: param("database"),
  };

  await resolvePostgresInstanceByContainer(form.container);
  validatePostgresDatabaseName(form.database);
  return form;
}

export function validateMariaDbInstanceName(name) {
  validateInstanceName(name, "MariaDB");
}

export function validatePostgresInstanceName(name) {
  validateInstanceName(name, "Postgres");
}

export function parseJsonOutput(output) {
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`Command returned invalid JSON: ${output}`);
  }
}

function validateMariaDbDatabaseName(database) {
  assert(/^[A-Za-z0-9_$.-]+$/.test(database || ""), "Invalid database name");
}

function validatePostgresDatabaseName(database) {
  assert(/^[A-Za-z0-9_]+$/.test(database || ""), "Invalid Postgres database name");
}

function validateDumpFilePath(filePath, extensions) {
  assert(filePath, "Dump file path is required");
  assert(!/[\0\r\n]/.test(filePath), "Invalid dump file path");
  assert(
    extensions.some((extension) => String(filePath).endsWith(`.${extension}`)),
    "Invalid dump file extension",
  );
}
