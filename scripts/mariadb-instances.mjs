#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const instancesPath = path.join(cwd, "docker/mariadb/instances.json");
const composeDir = "docker/compose";
const phpmyadminPath = "docker/phpmyadmin";
const defaultStartPort = 3307;
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

  if (command === "add") return await addInstance(options);
  if (command === "generate") return await generate();
  if (command === "list") return list();
  if (command === "resolve") return resolveInstance(options);
  if (command === "run") return await runInstance(options);

  throw new Error(
    "Usage: node scripts/mariadb-instances.mjs add|generate|list|resolve|run",
  );
}

async function addInstance(options) {
  const version = required(options.version, "VERSION is required");
  const authMode = options["auth-mode"] || "config";
  const user = required(options.user, "USER is required");
  const password = required(options.password, "PASSWORD is required");
  const rootPassword = required(
    options["root-password"],
    "ROOT_PASSWORD is required",
  );

  assert(/^\d+(\.\d+){1,2}$/.test(version), "Invalid VERSION");
  assert(
    authMode === "config" || authMode === "cookie",
    "AUTH_MODE must be config or cookie",
  );

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
    container: `mariadb-${name}-container`,
    composeFile: composeFileFor(name),
    volume: `mariadb-${name}-data`,
    hostPort,
    user,
    password,
    rootPassword,
    authMode,
    existing: false,
  };

  instances.push(instance);
  writeInstances(instances);
  mkdirSync(path.join(cwd, composeDir), { recursive: true });
  writeFileSync(path.join(cwd, instance.composeFile), composeFor(instance));
  await generate();
  console.log(
    `Added MariaDB ${version}: ${instance.composeFile} on port ${hostPort}`,
  );
}

async function generate() {
  const instances = readInstances();

  await mkdir(path.join(cwd, phpmyadminPath), { recursive: true });
  const config = phpmyadminConfigFor(instances);
  writeFileSync(path.join(cwd, phpmyadminPath, "config.inc.php"), config);

  console.log(
    `Generated phpMyAdmin config for ${instances.length} MariaDB instance(s)`,
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
    `Unknown MariaDB instance field: ${field}`,
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
      `docker compose -f ${quoteShell(instance.composeFile)} down && docker rmi mariadb:${quoteShell(
        instance.version,
      )} 2>/dev/null || true`,
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
  if (!existsSync(instancesPath)) return [];
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
  mariadb-${instance.name}:
    image: mariadb:${instance.version}
    container_name: ${instance.container}
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${quoteYaml(instance.rootPassword)}
      MYSQL_ROOT_HOST: "%"
      MYSQL_USER: ${quoteYaml(instance.user)}
      MYSQL_PASSWORD: ${quoteYaml(instance.password)}
    ports:
      - "${instance.hostPort}:3306"
    volumes:
      - ${instance.volume}:/var/lib/mysql
      - ../mariadb/config.cnf:/etc/mysql/conf.d/config.cnf
    networks:
      - proxy

volumes:
  ${instance.volume}:

networks:
  proxy:
    external: true
`;
}

function phpmyadminConfigFor(instances) {
  return `<?php
$i = 0;

${instances.map((instance) => phpmyadminServerFor(instance)).join("\n")}`;
}

function phpmyadminServerFor(instance) {
  const authMode = instance.authMode;
  const rows = [
    "$i++;",
    `$cfg['Servers'][$i]['verbose'] = ${quotePhp(`MariaDB ${instance.version}`)};`,
    `$cfg['Servers'][$i]['host'] = ${quotePhp(instance.container)};`,
    "$cfg['Servers'][$i]['port'] = '3306';",
    `$cfg['Servers'][$i]['auth_type'] = ${quotePhp(authMode)};`,
  ];

  if (authMode === "config") {
    rows.push(`$cfg['Servers'][$i]['user'] = ${quotePhp(instance.user)};`);
    rows.push(
      `$cfg['Servers'][$i]['password'] = ${quotePhp(instance.password)};`,
    );
  }

  return `${rows.join("\n")}\n`;
}

function findFreePort(instances) {
  const used = new Set(instances.map((instance) => Number(instance.hostPort)));
  let port = defaultStartPort;
  while (used.has(port)) port += 1;
  return port;
}

function versionName(version) {
  return version.replaceAll(".", "-");
}

function composeFileFor(name) {
  return `${composeDir}/docker-compose-mariadb-${name}.yml`;
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

function quotePhp(value) {
  return `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
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
