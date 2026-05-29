#!/usr/bin/env node
import { parseArgs, printJson } from "../common/cli.mjs";
import {
  getServer,
  initStore,
  input,
  nextId,
  normalizeServer,
  readId,
  readStore,
  runInherit,
  sshCommand,
  updateServerById,
  writeStore,
} from "./common.mjs";

const action = process.argv[2] || "";
const options = parseArgs(process.argv.slice(3));

try {
  switch (action) {
    case "init":
      initStore();
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
      runSsh(["echo connected && hostname"]);
      break;
    case "connect":
      runSsh();
      break;
    default:
      usage();
      process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function addServer() {
  const store = readStore();
  const server = normalizeServer({
    id: nextId(store.servers),
    name: input(options, "NAME"),
    host: input(options, "HOST"),
    port: input(options, "PORT") || "22",
    user: input(options, "USER"),
    authType: input(options, "AUTH_TYPE") || "password",
    keyPath: input(options, "KEY_PATH"),
    password: input(options, "PASSWORD"),
    passwordMode: input(options, "PASSWORD_MODE") || "manual",
  });

  store.servers.push(server);
  writeStore(store);
  printJson(server);
}

function updateServer() {
  const id = readId(input(options, "ID"));
  const next = updateServerById(id, (current) => ({
    ...current,
    name: input(options, "NAME", current.name),
    host: input(options, "HOST", current.host),
    port: input(options, "PORT", current.port),
    user: input(options, "USER", current.user),
    authType: input(options, "AUTH_TYPE", current.authType),
    keyPath: input(options, "KEY_PATH", current.keyPath),
    password: input(options, "PASSWORD", current.password),
    passwordMode: input(options, "PASSWORD_MODE", current.passwordMode),
  }));

  printJson(next);
}

function removeServer() {
  const store = readStore();
  const id = readId(input(options, "ID"));
  const nextServers = store.servers.filter((server) => server.id !== id);
  if (nextServers.length === store.servers.length)
    throw new Error(`SSH server not found: ${id}`);

  writeStore({ servers: nextServers });
  console.log(`Removed SSH server #${id}`);
}

function runSsh(remoteCommand = []) {
  const server = getServer(readId(input(options, "ID")));
  assertUiCanRunSsh(server);
  const { command, args } = sshCommand(server, remoteCommand);
  runInherit(command, args);
}

function assertUiCanRunSsh(server) {
  if (
    process.env.SSH_UI === "1" &&
    server.authType === "password" &&
    server.passwordMode === "manual"
  ) {
    throw new Error(
      "PASSWORD_MODE=manual cannot be used from Web UI terminal: ssh asks the password in the host TTY. Switch this server to PASSWORD_MODE=sshpass or AUTH_TYPE=key, or run make ssh-connect ID=... in your host terminal.",
    );
  }
}

function usage() {
  console.log("Usage:");
  console.log("  make ssh-init");
  console.log("  make ssh-list");
  console.log(
    "  make ssh-add NAME=prod HOST=example.com USER=root PASSWORD=secret",
  );
  console.log(
    "  make ssh-update ID=1 NAME=prod HOST=example.com USER=root PASSWORD=secret",
  );
  console.log("  make ssh-remove ID=1");
  console.log("  make ssh-test ID=1");
  console.log("  make ssh-connect ID=1");
}
