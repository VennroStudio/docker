import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { required } from "../common/cli.mjs";

export const rootDir = process.cwd();
export const serversFile = path.resolve(
  rootDir,
  process.env.SSH_SERVERS_FILE || "config/ssh-servers.json",
);

export function initStore() {
  if (existsSync(serversFile)) {
    writeStore(readStore());
    console.log(
      `SSH servers already exists: ${path.relative(rootDir, serversFile)}`,
    );
    return;
  }

  writeStore({ servers: [] });
  console.log(
    `Created SSH servers file: ${path.relative(rootDir, serversFile)}`,
  );
}

export function readStore() {
  if (!existsSync(serversFile)) return { servers: [] };

  const payload = JSON.parse(readFileSync(serversFile, "utf8"));
  if (Array.isArray(payload))
    return { servers: payload.map(normalizeStoredServer) };

  return {
    servers: Array.isArray(payload.servers)
      ? payload.servers.map(normalizeStoredServer)
      : [],
  };
}

export function writeStore(store) {
  mkdirSync(path.dirname(serversFile), { recursive: true });
  writeFileSync(
    serversFile,
    `${JSON.stringify({ servers: store.servers }, null, 2)}\n`,
    "utf8",
  );
}

export function getServer(id) {
  const server = readStore().servers.find((item) => item.id === id);
  if (!server) throw new Error(`SSH server not found: ${id}`);
  return server;
}

export function updateServerById(id, updater) {
  const store = readStore();
  const index = store.servers.findIndex((server) => server.id === id);
  if (index === -1) throw new Error(`SSH server not found: ${id}`);

  const next = normalizeServer(updater(store.servers[index]));
  store.servers[index] = next;
  writeStore(store);
  return next;
}

export function normalizeServer(server) {
  const normalized = {
    id: normalizeId(server.id),
    name: requiredString(server.name, "NAME is required"),
    host: requiredString(server.host, "HOST is required"),
    port: normalizePort(server.port),
    user: requiredString(server.user, "USER is required"),
    authType: server.authType || "password",
    keyPath: server.keyPath || "",
    password: server.password || "",
    passwordMode: server.passwordMode || "manual",
  };

  assertNoWhitespace(normalized.host, "HOST must not contain whitespace");
  assertNoWhitespace(normalized.user, "USER must not contain whitespace");

  if (!["password", "key"].includes(normalized.authType)) {
    throw new Error("AUTH_TYPE must be password or key");
  }

  if (!["manual", "sshpass"].includes(normalized.passwordMode)) {
    throw new Error("PASSWORD_MODE must be manual or sshpass");
  }

  if (normalized.authType === "password" && normalized.passwordMode === "sshpass") {
    requiredString(
      normalized.password,
      "PASSWORD is required for AUTH_TYPE=password and PASSWORD_MODE=sshpass",
    );
  }

  if (normalized.authType === "key") {
    requiredString(
      normalized.keyPath,
      "KEY_PATH is required for AUTH_TYPE=key",
    );
  }

  return normalized;
}

export function nextId(servers) {
  return (
    servers.reduce((max, server) => Math.max(max, Number(server.id) || 0), 0) +
    1
  );
}

export function readId(value) {
  return normalizeId(value);
}

export function input(options, name, fallback = "") {
  return (
    options[name.toLowerCase().replaceAll("_", "-")] ||
    process.env[name] ||
    fallback
  );
}

export function expandHome(value) {
  if (!value.startsWith("~/")) return value;
  return path.join(os.homedir(), value.slice(2));
}

export function ensureCommand(command, message) {
  const result = spawnSync(command, ["-V"], { stdio: "ignore" });
  if (result.error) throw new Error(message);
}

export function runInherit(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

export function sshCommand(server, remoteCommand = [], overrides = {}) {
  const authType = overrides.authType || server.authType;
  const passwordMode = overrides.passwordMode || server.passwordMode;
  const password = overrides.password ?? server.password;
  const keyPath = overrides.keyPath || server.keyPath;
  const target = `${server.user}@${server.host}`;
  const sshArgs = ["-p", String(server.port)];

  if (authType === "key") {
    sshArgs.push("-i", expandHome(keyPath));
  }

  sshArgs.push(target, ...remoteCommand);

  if (authType === "password" && passwordMode === "sshpass") {
    ensureCommand("sshpass", "sshpass is required for PASSWORD_MODE=sshpass");
    return { command: "sshpass", args: ["-p", password, "ssh", ...sshArgs] };
  }

  return { command: "ssh", args: sshArgs };
}

function normalizeStoredServer(server) {
  return normalizeServer({
    id: server.id,
    name: server.name,
    host: server.host,
    port: server.port,
    user: server.user,
    authType: server.authType,
    keyPath: server.keyPath,
    password: server.password,
    passwordMode: server.passwordMode,
  });
}

function normalizeId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1)
    throw new Error("ID must be a positive integer");
  return id;
}

function normalizePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be between 1 and 65535");
  }
  return String(port);
}

function requiredString(value, message) {
  return required(String(value || "").trim(), message);
}

function assertNoWhitespace(value, message) {
  if (/\s/.test(value)) throw new Error(message);
}
