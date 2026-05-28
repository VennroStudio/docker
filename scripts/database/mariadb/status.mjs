#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { containerStatus, parseArgs, printJson, settingsUrl } from "../status-common.mjs";

const cwd = process.cwd();
const instancesPath = path.join(cwd, "docker/mariadb/instances.json");
const phpMyAdminContainer = "phpmyadmin-container";

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const [command = "overview", ...args] = process.argv.slice(2);
  const options = parseArgs(args);

  if (command === "overview") return printJson(await overview());
  if (command === "instance") return printJson(await instanceStatus(options));
  if (command === "phpmyadmin") return printJson(await phpMyAdminStatus());

  throw new Error("Usage: node scripts/database/mariadb/status.mjs overview|instance|phpmyadmin");
}

async function overview() {
  const instances = readInstances();

  return {
    instances: await Promise.all(instances.map(publicInstance)),
    phpmyadmin: await phpMyAdminStatus(),
  };
}

async function phpMyAdminStatus() {
  return {
    ...(await containerStatus(phpMyAdminContainer)),
    url: await settingsUrl("phpmyadmin.pmaUrl"),
  };
}

async function instanceStatus(options) {
  const instance = findTargetInstance(options);
  return publicInstance(instance);
}

async function publicInstance(instance) {
  const status = await containerStatus(instance.container);

  return {
    authMode: instance.authMode,
    composeFile: instance.composeFile,
    container: instance.container,
    existing: instance.existing,
    hostPort: instance.hostPort,
    name: instance.name,
    state: status.state,
    status: status.status,
    running: status.running,
    uptime: status.uptime,
    version: instance.version,
    volume: instance.volume,
  };
}

function findTargetInstance(options) {
  const instances = readInstances();
  const name = options.name || process.env.MARIADB_NAME || process.env.NAME;
  const container =
    options.container || process.env.MARIADB_CONTAINER || process.env.CONTAINER;

  if (name) {
    const instance = instances.find((item) => item.name === name);
    assert(instance, `MariaDB instance ${name} is not configured`);
    return instance;
  }

  if (container) {
    const instance = instances.find((item) => item.container === container);
    assert(instance, `MariaDB container ${container} is not configured`);
    return instance;
  }

  assert(
    instances.length === 1,
    "MariaDB instance is required. Pass NAME=instance-name or CONTAINER=container-name",
  );

  return instances[0];
}

function readInstances() {
  ensureInstancesFile();
  const instances = JSON.parse(readFileSync(instancesPath, "utf8"));
  const normalized = instances.map((instance) => ({
    ...instance,
    composeFile: `docker/compose/docker-compose-mariadb-${instance.name}.yml`,
  }));

  return normalized;
}

function ensureInstancesFile() {
  mkdirSync(path.dirname(instancesPath), { recursive: true });
  if (!existsSync(instancesPath)) writeFileSync(instancesPath, "[]\n");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
