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
    case "show":
      showKey();
      break;
    case "test":
      testKey();
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

function showKey() {
  const server = requireKeyServer();
  const publicKeyPath = `${expandHome(server.keyPath)}.pub`;
  if (!existsSync(publicKeyPath))
    throw new Error(`Public key does not exist: ${server.keyPath}.pub`);
  console.log(readFileSync(publicKeyPath, "utf8").trim());
}

function testKey() {
  const server = requireKeyServer();
  const { command, args } = sshCommand(server, ["echo connected && hostname"], {
    authType: "key",
  });
  runInherit(command, args);
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

function usage() {
  console.log("Usage:");
  console.log("  make ssh-key-generate ID=1");
  console.log("  make ssh-key-push ID=1");
  console.log("  make ssh-key-show ID=1");
  console.log("  make ssh-key-test ID=1");
  console.log(`Root: ${rootDir}`);
}
