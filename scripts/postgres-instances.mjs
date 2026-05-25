#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const instancesPath = path.join(cwd, "docker/postgres/instances.json");
const defaultStartPort = 5433;

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  const options = parseArgs(args);

  if (command === "add") return addInstance(options);
  if (command === "list") return list();

  throw new Error("Usage: node scripts/postgres-instances.mjs add|list");
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
  assert(Number.isInteger(hostPort) && hostPort > 0 && hostPort <= 65535, "Invalid PORT");
  assert(!instances.some((instance) => instance.name === name), `Instance ${name} already exists`);
  assert(!instances.some((instance) => Number(instance.hostPort) === hostPort), `Port ${hostPort} is already used`);

  const instance = {
    name,
    version,
    container: `postgres-${name}-container`,
    composeFile: `docker-compose-postgres-${name}.yml`,
    volume: `postgres-${name}-data`,
    hostPort,
    user,
    password,
    database,
    existing: false,
  };

  instances.push(instance);
  writeInstances(instances);
  writeFileSync(path.join(cwd, instance.composeFile), composeFor(instance));
  console.log(`Added Postgres ${version}: ${instance.composeFile} on port ${hostPort}`);
}

function list() {
  console.log(JSON.stringify(readInstances(), null, 2));
}

function readInstances() {
  ensureInstancesFile();
  return JSON.parse(readFileSync(instancesPath, "utf8"));
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
  const used = new Set([5432, ...instances.map((instance) => Number(instance.hostPort))]);
  let port = defaultStartPort;
  while (used.has(port)) port += 1;
  return port;
}

function versionName(version) {
  return version.replaceAll(".", "-");
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
