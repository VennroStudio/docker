#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const instancesPath = path.join(cwd, "docker/postgres/instances.json");
const composeDir = "docker/compose";
const defaultStartPort = 5433;
const runActions = new Set([
  "clean",
  "down",
  "logs",
  "shell",
  "start",
  "stop",
  "up",
]);

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const [command, ...args] = process.argv.slice(2);
  const options = parseArgs(args);

  if (command === "add") return addInstance(options);
  if (command === "list") return list();
  if (command === "resolve") return resolveInstance(options);
  if (command === "run") return await runInstance(options);

  throw new Error(
    "Usage: node scripts/database/postgres/instances.mjs add|list|resolve|run",
  );
}

function addInstance(options) {
  const version = required(options.version, "VERSION is required");
  const user = required(options.user, "USER is required");
  const password = required(options.password, "PASSWORD is required");
  const database = required(options.database, "DATABASE is required");

  assert(/^\d+(\.\d+)?$/.test(version), "Invalid VERSION");
  assert(/^[a-zA-Z0-9_]+$/.test(user), "Invalid USER");
  assert(/^[a-zA-Z0-9_]+$/.test(database), "Invalid DATABASE");

  const instances = readInstances();
  const name = options.name || versionName(version);
  const hostPort = Number(options.port || findFreePort(instances));

  assert(/^[a-z0-9][a-z0-9-]*$/.test(name), "Invalid NAME");
  assert(
    Number.isInteger(hostPort) && hostPort > 0 && hostPort <= 65535,
    "Invalid PORT",
  );
  assert(
    !instances.some((instance) => instance.name === name),
    `Instance ${name} already exists`,
  );
  assert(
    !instances.some((instance) => Number(instance.hostPort) === hostPort),
    `Port ${hostPort} is already used`,
  );

  const instance = {
    name,
    version,
    container: `postgres-${name}-container`,
    composeFile: composeFileFor(name),
    volume: `postgres-${name}-data`,
    hostPort,
    user,
    password,
    database,
    existing: false,
  };

  instances.push(instance);
  writeInstances(instances);
  mkdirSync(path.join(cwd, composeDir), { recursive: true });
  writeFileSync(path.join(cwd, instance.composeFile), composeFor(instance));
  console.log(
    `Added Postgres ${version}: ${instance.composeFile} on port ${hostPort}`,
  );
}

function list() {
  console.log(JSON.stringify(readInstances(), null, 2));
}

function resolveInstance(options) {
  const instance = findTargetInstance(options);
  const field = options.field || "json";

  if (field === "json") {
    console.log(JSON.stringify(instance, null, 2));
    return;
  }

  assert(
    Object.hasOwn(instance, field),
    `Unknown Postgres instance field: ${field}`,
  );
  console.log(instance[field]);
}

async function runInstance(options) {
  const action = required(options.action, "ACTION is required");
  assert(
    runActions.has(action),
    "ACTION must be clean, down, logs, shell, start, stop or up",
  );

  const instance = findTargetInstance(options);

  if (action === "shell") {
    return await run("docker", ["exec", "-it", instance.container, "sh"]);
  }

  if (action === "clean") {
    return await run("sh", [
      "-lc",
      `docker compose -f ${quoteShell(instance.composeFile)} down && docker rmi postgres:${quoteShell(
        instance.version,
      )}-alpine 2>/dev/null || true`,
    ]);
  }

  const args = ["compose", "-f", instance.composeFile];
  if (action === "up") args.push("up", "-d");
  else if (action === "logs") args.push("logs", "-f");
  else args.push(action);

  await run("docker", args);
}

function findTargetInstance(options) {
  const instances = readInstances();
  const name = options.name || process.env.POSTGRES_NAME || process.env.NAME;
  const container =
    options.container ||
    process.env.POSTGRES_CONTAINER ||
    process.env.CONTAINER;

  if (name) {
    const instance = instances.find((item) => item.name === name);
    assert(instance, `Postgres instance ${name} is not configured`);
    return instance;
  }

  if (container) {
    const instance = instances.find((item) => item.container === container);
    assert(instance, `Postgres container ${container} is not configured`);
    return instance;
  }

  assert(
    instances.length === 1,
    "Postgres instance is required. Pass NAME=instance-name or CONTAINER=container-name",
  );

  return instances[0];
}

function readInstances() {
  ensureInstancesFile();
  const instances = JSON.parse(readFileSync(instancesPath, "utf8"));
  const normalized = instances.map((instance) => ({
    ...instance,
    composeFile: composeFileFor(instance.name),
  }));
  if (
    JSON.stringify(instances.map((instance) => instance.composeFile)) !==
    JSON.stringify(normalized.map((instance) => instance.composeFile))
  ) {
    writeInstances(normalized);
  }
  return normalized;
}

function writeInstances(instances) {
  ensureInstancesFile();
  writeFileSync(instancesPath, `${JSON.stringify(instances, null, 2)}\n`);
}

function ensureInstancesFile() {
  mkdirSync(path.dirname(instancesPath), { recursive: true });
  if (!existsSync(instancesPath)) writeFileSync(instancesPath, "[]\n");
}

function composeFor(instance) {
  return `name: vennro

services:
  postgres-${instance.name}:
    image: postgres:${instance.version}-alpine
    container_name: ${instance.container}
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${quoteYaml(instance.user)}
      POSTGRES_PASSWORD: ${quoteYaml(instance.password)}
      POSTGRES_DB: ${quoteYaml(instance.database)}
    ports:
      - "${instance.hostPort}:5432"
    volumes:
      - ${instance.volume}:/var/lib/postgresql/data
    networks:
      - proxy

volumes:
  ${instance.volume}:

networks:
  proxy:
    external: true
`;
}

function findFreePort(instances) {
  const used = new Set([
    5432,
    ...instances.map((instance) => Number(instance.hostPort)),
  ]);
  let port = defaultStartPort;
  while (used.has(port)) port += 1;
  return port;
}

function versionName(version) {
  return version.replaceAll(".", "-");
}

function composeFileFor(name) {
  return `${composeDir}/docker-compose-postgres-${name}.yml`;
}

function parseArgs(args) {
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) options[key] = "1";
    else {
      options[key] = next;
      index += 1;
    }
  }

  return options;
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `${command} ${args.join(" ")} failed with exit code ${code}`,
          ),
        );
    });
  });
}

function quoteShell(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function quoteYaml(value) {
  return `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function required(value, message) {
  assert(value, message);
  return value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
