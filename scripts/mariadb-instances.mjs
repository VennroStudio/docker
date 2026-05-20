#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const instancesPath = path.join(cwd, "docker/mariadb/instances.json");
const instancesExamplePath = path.join(cwd, "docker/mariadb/instances.example.json");
const phpmyadminPath = "docker/phpmyadmin";
const phpmyadminCompatibilityPath = "docker/local/phpmyadmin";
const defaultStartPort = 3307;

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

  throw new Error("Usage: node scripts/mariadb-instances.mjs add|generate|list");
}

async function addInstance(options) {
  const version = required(options.version, "VERSION is required");
  const authMode = options["auth-mode"] || "config";
  const user = required(options.user, "USER is required");
  const password = required(options.password, "PASSWORD is required");
  const rootPassword = required(options["root-password"], "ROOT_PASSWORD is required");

  assert(/^\d+(\.\d+){1,2}$/.test(version), "Invalid VERSION");
  assert(authMode === "config" || authMode === "cookie", "AUTH_MODE must be config or cookie");

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
    container: `mariadb-${name}-container`,
    composeFile: `docker-compose-mariadb-${name}.yml`,
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
  writeFileSync(path.join(cwd, instance.composeFile), composeFor(instance));
  await generate();
  console.log(`Added MariaDB ${version}: ${instance.composeFile} on port ${hostPort}`);
}

async function generate() {
  const instances = readInstances();

  await mkdir(path.join(cwd, phpmyadminPath), { recursive: true });
  const config = phpmyadminConfigFor(instances);
  writeFileSync(path.join(cwd, phpmyadminPath, "config.inc.php"), config);

  if (existsSync(path.join(cwd, phpmyadminCompatibilityPath))) {
    writeFileSync(path.join(cwd, phpmyadminCompatibilityPath, "config.inc.php"), config);
  }

  console.log(`Generated phpMyAdmin config for ${instances.length} MariaDB instance(s)`);
}

function list() {
  console.log(JSON.stringify(readInstances(), null, 2));
}

function readInstances() {
  if (!existsSync(instancesPath) && existsSync(instancesExamplePath)) {
    const example = readFileSync(instancesExamplePath, "utf8");
    writeFileSync(instancesPath, example.endsWith("\n") ? example : `${example}\n`);
  }

  if (!existsSync(instancesPath)) return [];
  return JSON.parse(readFileSync(instancesPath, "utf8"));
}

function writeInstances(instances) {
  writeFileSync(instancesPath, `${JSON.stringify(instances, null, 2)}\n`);
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
      - ./docker/mariadb/config.cnf:/etc/mysql/conf.d/config.cnf
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
    rows.push(`$cfg['Servers'][$i]['password'] = ${quotePhp(instance.password)};`);
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

function quotePhp(value) {
  return `'${String(value).replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
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
