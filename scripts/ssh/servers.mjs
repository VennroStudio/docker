#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs, printJson, required } from "../common/cli.mjs";

const action = process.argv[2] || "";
const options = parseArgs(process.argv.slice(3));
const rootDir = process.cwd();
const serversFile = path.resolve(rootDir, process.env.SSH_SERVERS_FILE || "config/ssh-servers.json");

try {
  switch (action) {
    case "init":
      initServers();
      break;
    case "list":
      printJson(readStore());
      break;
    case "add":
      addServer();
      break;
    case "update":
      updateServer();
      break;
    case "remove":
      removeServer();
      break;
    case "test":
      testServer();
      break;
    case "connect":
      connectServer();
      break;
    default:
      usage();
      process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function initServers() {
  if (existsSync(serversFile)) {
    writeStore(readStore());
    console.log(`SSH servers already exists: ${path.relative(rootDir, serversFile)}`);
    return;
  }

  writeStore({ servers: [] });
  console.log(`Created SSH servers file: ${path.relative(rootDir, serversFile)}`);
}

function addServer() {
  const store = readStore();
  const server = normalizeServer({
    id: nextId(store.servers),
    name: input("NAME"),
    host: input("HOST"),
    port: input("PORT") || "22",
    user: input("USER"),
    authType: input("AUTH_TYPE") || "password",
    keyPath: input("KEY_PATH"),
    password: input("PASSWORD"),
    passwordMode: input("PASSWORD_MODE") || "manual",
  });

  store.servers.push(server);
  writeStore(store);
  printJson(server);
}

function updateServer() {
  const store = readStore();
  const id = readId();
  const index = store.servers.findIndex((server) => server.id === id);
  if (index === -1) throw new Error(`SSH server not found: ${id}`);

  const current = store.servers[index];
  const next = normalizeServer({
    ...current,
    name: input("NAME", current.name),
    host: input("HOST", current.host),
    port: input("PORT", current.port),
    user: input("USER", current.user),
    authType: input("AUTH_TYPE", current.authType),
    keyPath: input("KEY_PATH", current.keyPath),
    password: input("PASSWORD", current.password),
    passwordMode: input("PASSWORD_MODE", current.passwordMode),
  });

  store.servers[index] = next;
  writeStore(store);
  printJson(next);
}

function removeServer() {
  const store = readStore();
  const id = readId();
  const nextServers = store.servers.filter((server) => server.id !== id);
  if (nextServers.length === store.servers.length) throw new Error(`SSH server not found: ${id}`);

  writeStore({ servers: nextServers });
  console.log(`Removed SSH server #${id}`);
}

function testServer() {
  const server = getServer(readId());
  runSsh(server, ["echo connected && hostname"]);
}

function connectServer() {
  const server = getServer(readId());
  runSsh(server);
}

function getServer(id) {
  const server = readStore().servers.find((item) => item.id === id);
  if (!server) throw new Error(`SSH server not found: ${id}`);
  return server;
}

function runSsh(server, remoteCommand = []) {
  const { command, args } = sshCommand(server, remoteCommand);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

function sshCommand(server, remoteCommand) {
  const target = `${server.user}@${server.host}`;
  const sshArgs = ["-p", String(server.port)];

  if (server.authType === "key") {
    sshArgs.push("-i", expandHome(server.keyPath));
  }

  sshArgs.push(target, ...remoteCommand);

  if (server.authType === "password" && server.passwordMode === "sshpass") {
    ensureCommand("sshpass", "sshpass is required for PASSWORD_MODE=sshpass");
    return { command: "sshpass", args: ["-p", server.password, "ssh", ...sshArgs] };
  }

  return { command: "ssh", args: sshArgs };
}

function ensureCommand(command, message) {
  const result = spawnSync(command, ["-V"], { stdio: "ignore" });
  if (result.error) throw new Error(message);
}

function readStore() {
  if (!existsSync(serversFile)) return { servers: [] };

  const payload = JSON.parse(readFileSync(serversFile, "utf8"));
  if (Array.isArray(payload)) return { servers: payload.map(normalizeStoredServer) };
  return {
    servers: Array.isArray(payload.servers) ? payload.servers.map(normalizeStoredServer) : [],
  };
}

function writeStore(store) {
  mkdirSync(path.dirname(serversFile), { recursive: true });
  writeFileSync(serversFile, `${JSON.stringify({ servers: store.servers }, null, 2)}\n`, "utf8");
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

function normalizeServer(server) {
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

  if (normalized.authType === "password") {
    requiredString(normalized.password, "PASSWORD is required for AUTH_TYPE=password");
    normalized.keyPath = "";
  }

  if (normalized.authType === "key") {
    requiredString(normalized.keyPath, "KEY_PATH is required for AUTH_TYPE=key");
    normalized.password = "";
    normalized.passwordMode = "manual";
  }

  return normalized;
}

function nextId(servers) {
  return servers.reduce((max, server) => Math.max(max, Number(server.id) || 0), 0) + 1;
}

function readId() {
  return normalizeId(input("ID"));
}

function normalizeId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) throw new Error("ID must be a positive integer");
  return id;
}

function normalizePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be between 1 and 65535");
  }
  return String(port);
}

function input(name, fallback = "") {
  return options[name.toLowerCase().replaceAll("_", "-")] || process.env[name] || fallback;
}

function requiredString(value, message) {
  return required(String(value || "").trim(), message);
}

function assertNoWhitespace(value, message) {
  if (/\s/.test(value)) throw new Error(message);
}

function expandHome(value) {
  if (!value.startsWith("~/")) return value;
  return path.join(os.homedir(), value.slice(2));
}

function usage() {
  console.log("Usage:");
  console.log("  make ssh-init");
  console.log("  make ssh-list");
  console.log("  make ssh-add NAME=prod HOST=example.com USER=root PASSWORD=secret");
  console.log("  make ssh-update ID=1 NAME=prod HOST=example.com USER=root PASSWORD=secret");
  console.log("  make ssh-remove ID=1");
  console.log("  make ssh-test ID=1");
  console.log("  make ssh-connect ID=1");
}
