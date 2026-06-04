#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs, printJson, required } from "../common/cli.mjs";
import { getServer, input, readId, rootDir } from "./common.mjs";

const commandsFile = path.resolve(
  rootDir,
  process.env.SSH_COMMANDS_FILE || "config/ssh-commands.json",
);
const action = process.argv[2] || "";
const options = parseArgs(process.argv.slice(3));

try {
  switch (action) {
    case "init":
      initStore();
      break;
    case "list":
      listCommands();
      break;
    case "add":
      addCommand();
      break;
    case "update":
      updateCommand();
      break;
    case "remove":
      removeCommand();
      break;
    default:
      usage();
      process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function initStore() {
  if (existsSync(commandsFile)) {
    writeStore(readStore());
    console.log(
      `SSH commands already exists: ${path.relative(rootDir, commandsFile)}`,
    );
    return;
  }

  writeStore({ commands: [] }, { allowCreate: true });
  console.log(
    `Created SSH commands file: ${path.relative(rootDir, commandsFile)}`,
  );
}

function listCommands() {
  const serverId = input(options, "SERVER_ID");
  const commands = readStore().commands.filter((command) => {
    if (!serverId) return true;
    return command.serverId === readId(serverId);
  });

  printJson({ commands });
}

function addCommand() {
  const store = readStore();
  const serverId = readId(input(options, "SERVER_ID"));
  getServer(serverId);

  const command = normalizeCommand({
    id: nextCommandId(store.commands),
    command: input(options, "COMMAND"),
    serverId,
  });

  store.commands.push(command);
  writeStore(store);
  printJson(command);
}

function updateCommand() {
  const store = readStore();
  const id = readId(input(options, "ID"));
  const index = store.commands.findIndex((command) => command.id === id);
  if (index === -1) throw new Error(`SSH command not found: ${id}`);

  const command = normalizeCommand({
    ...store.commands[index],
    command: input(options, "COMMAND", store.commands[index].command),
  });

  store.commands[index] = command;
  writeStore(store);
  printJson(command);
}

function removeCommand() {
  const store = readStore();
  const id = readId(input(options, "ID"));
  const nextCommands = store.commands.filter((command) => command.id !== id);
  if (nextCommands.length === store.commands.length)
    throw new Error(`SSH command not found: ${id}`);

  writeStore({ commands: nextCommands });
  console.log(`Removed SSH command #${id}`);
}

function readStore() {
  requireInitializedStore();

  const payload = JSON.parse(readFileSync(commandsFile, "utf8"));
  if (Array.isArray(payload))
    return { commands: payload.map(normalizeStoredCommand) };

  return {
    commands: Array.isArray(payload.commands)
      ? payload.commands.map(normalizeStoredCommand)
      : [],
  };
}

function writeStore(store, { allowCreate = false } = {}) {
  if (!allowCreate) requireInitializedStore();
  mkdirSync(path.dirname(commandsFile), { recursive: true });
  writeFileSync(
    commandsFile,
    `${JSON.stringify({ commands: store.commands }, null, 2)}\n`,
    "utf8",
  );
}

function normalizeStoredCommand(command) {
  return normalizeCommand({
    id: command.id,
    command: command.command,
    serverId: command.serverId ?? command.server_id,
  });
}

function normalizeCommand(command) {
  const text = required(
    String(command.command || "").trim(),
    "COMMAND is required",
  );
  if (text.includes("\0"))
    throw new Error("COMMAND must not contain null bytes");

  return {
    command: text,
    id: readId(command.id),
    serverId: readId(command.serverId),
  };
}

function nextCommandId(commands) {
  return (
    commands.reduce(
      (max, command) => Math.max(max, Number(command.id) || 0),
      0,
    ) + 1
  );
}

function requireInitializedStore() {
  if (existsSync(commandsFile)) return;
  throw new Error(
    `SSH commands file is missing: ${displayPath(commandsFile)}. Run make init.`,
  );
}

function displayPath(file) {
  const relative = path.relative(rootDir, file);
  return relative.startsWith("..") ? file : relative;
}

function usage() {
  console.log("Usage:");
  console.log("  make ssh-command-list");
  console.log("  make ssh-command-list SERVER_ID=1");
  console.log("  make ssh-command-add SERVER_ID=1 COMMAND='docker ps'");
  console.log("  make ssh-command-update ID=1 COMMAND='df -h'");
  console.log("  make ssh-command-remove ID=1");
}
