#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { bool, parseArgs, printJson } from "../common/cli.mjs";
import {
  ensureCommand,
  expandHome,
  getServer,
  input,
  readId,
  rootDir,
  runInherit,
  sshCommand,
  updateServerById,
} from "./common.mjs";

const action = process.argv[2] || "";
const options = parseArgs(process.argv.slice(3));

try {
  switch (action) {
    case "generate":
      generateKey();
      break;
    case "push":
      pushKey();
      break;
    case "remove":
      removeKey();
      break;
    case "show":
      showKey();
      break;
    default:
      usage();
      process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function generateKey() {
  const id = readId(input(options, "ID"));
  const server = getServer(id);
  const keyPath = input(options, "KEY_PATH") || defaultKeyPath(server);
  const expandedKeyPath = expandHome(keyPath);
  const comment =
    input(options, "COMMENT") || `infrastructure:${server.id}:${server.name}`;
  const bits = input(options, "BITS") || "4096";
  const force = bool(input(options, "FORCE"));

  if (!/^\d+$/.test(bits) || Number(bits) < 1024)
    throw new Error("BITS must be 1024 or greater");
  if (
    (existsSync(expandedKeyPath) || existsSync(`${expandedKeyPath}.pub`)) &&
    !force
  ) {
    throw new Error(
      `SSH key already exists: ${keyPath}. Pass FORCE=1 to overwrite`,
    );
  }

  mkdirSync(path.dirname(expandedKeyPath), { recursive: true });
  if (force) {
    rmSync(expandedKeyPath, { force: true });
    rmSync(`${expandedKeyPath}.pub`, { force: true });
  }

  runInherit("ssh-keygen", [
    "-t",
    "rsa",
    "-b",
    bits,
    "-C",
    comment,
    "-f",
    expandedKeyPath,
    "-N",
    input(options, "PASSPHRASE"),
  ]);

  const next = updateServerById(id, (current) => ({
    ...current,
    authType: "key",
    keyPath,
  }));

  printJson(next);
}

function pushKey() {
  const server = requireKeyServer();
  const publicKeyPath = `${expandHome(server.keyPath)}.pub`;
  if (!existsSync(publicKeyPath))
    throw new Error(`Public key does not exist: ${server.keyPath}.pub`);

  if (hasCommand("ssh-copy-id")) {
    const args = [
      "-i",
      publicKeyPath,
      "-p",
      String(server.port),
      `${server.user}@${server.host}`,
    ];
    const command = passwordCommand(server, "ssh-copy-id", args);
    runInherit(command.command, command.args);
    return;
  }

  const publicKey = readFileSync(publicKeyPath, "utf8");
  const remoteCommand =
    "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys";
  const command = passwordCommand(server, "ssh", [
    "-p",
    String(server.port),
    `${server.user}@${server.host}`,
    remoteCommand,
  ]);
  const result = spawnSync(command.command, command.args, {
    input: publicKey,
    stdio: ["pipe", "inherit", "inherit"],
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

function removeKey() {
  const server = requireKeyServer();
  const publicKeyPath = `${expandHome(server.keyPath)}.pub`;
  if (!existsSync(publicKeyPath))
    throw new Error(`Public key does not exist: ${server.keyPath}.pub`);

  const publicKey = readFileSync(publicKeyPath, "utf8").trim();
  if (!publicKey) throw new Error(`Public key is empty: ${server.keyPath}.pub`);
  const [keyType, keyBlob] = publicKey.split(/\s+/);
  if (!keyType || !keyBlob)
    throw new Error(`Invalid public key: ${server.keyPath}.pub`);

  const matcher =
    "function has_key() { for (i = 1; i < NF; i++) if ($i == key_type && $(i + 1) == key_blob) return 1; return 0 }";
  const remoteCommand =
    "mkdir -p ~/.ssh && touch ~/.ssh/authorized_keys && " +
    "tmp_file=$(mktemp) && " +
    `match_count=$(awk -v key_type=${shellQuote(keyType)} -v key_blob=${shellQuote(keyBlob)} '${matcher} has_key() { count++ } END { print count + 0 }' ~/.ssh/authorized_keys) && ` +
    `awk -v key_type=${shellQuote(keyType)} -v key_blob=${shellQuote(keyBlob)} '${matcher} has_key() { next } { print }' ~/.ssh/authorized_keys > "$tmp_file" && ` +
    "cat \"$tmp_file\" > ~/.ssh/authorized_keys && " +
    "rm -f \"$tmp_file\" && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys && " +
    "if [ \"$match_count\" -gt 0 ]; then echo \"Removed RSA key from ~/.ssh/authorized_keys\"; else echo \"RSA key is not present in ~/.ssh/authorized_keys\"; fi";
  const { command, args } = sshCommand(server, [remoteCommand]);
  runInherit(command, args);

  const next = updateServerById(server.id, (current) => ({
    ...current,
    authType: "password",
    keyPath: "",
    passwordMode: "manual",
  }));
  console.log("Updated SSH server auth type to password and cleared KEY_PATH");
  printJson(next);
}

function showKey() {
  const server = requireKeyServer();
  const publicKeyPath = `${expandHome(server.keyPath)}.pub`;
  if (!existsSync(publicKeyPath))
    throw new Error(`Public key does not exist: ${server.keyPath}.pub`);
  console.log(readFileSync(publicKeyPath, "utf8").trim());
}

function requireKeyServer() {
  const server = getServer(readId(input(options, "ID")));
  if (!server.keyPath)
    throw new Error("KEY_PATH is empty. Run make ssh-key-generate ID=...");
  return server;
}

function passwordCommand(server, command, args) {
  if (server.passwordMode !== "sshpass") return { command, args };
  ensureCommand("sshpass", "sshpass is required for PASSWORD_MODE=sshpass");
  return {
    command: "sshpass",
    args: ["-p", server.password, command, ...args],
  };
}

function hasCommand(command) {
  const result = spawnSync(
    "sh",
    ["-c", 'command -v "$1" >/dev/null 2>&1', "sh", command],
    { stdio: "ignore" },
  );
  return result.status === 0;
}

function defaultKeyPath(server) {
  return path.posix.join(
    "~/.ssh/infrastructure",
    `${server.id}-${safeName(server.name)}_rsa`,
  );
}

function safeName(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function usage() {
  console.log("Usage:");
  console.log("  make ssh-key-generate ID=1");
  console.log("  make ssh-key-push ID=1");
  console.log("  make ssh-key-remove ID=1");
  console.log("  make ssh-key-show ID=1");
  console.log(`Root: ${rootDir}`);
}
