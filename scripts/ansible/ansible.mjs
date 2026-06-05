#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assert, bool, parseArgs, printJson, required } from "../common/cli.mjs";
import { expandHome, getServer, input, readId, rootDir } from "../ssh/common.mjs";

const configDir = path.resolve(rootDir, "config");
const configFile = path.resolve(
  rootDir,
  process.env.INFRA_ANSIBLE_CONFIG_FILE || "config/ansible.json",
);
const runtimeDir = path.resolve(rootDir, ".runtime/ansible");
const composeFile = "docker/compose/docker-compose-ansible.yml";
const playbookPath = "/ansible/deploy.yml";

const defaultConfig = {
  REPO_URL: "https://github.com/VennroStudio/docker.git",
  REPO_BRANCH: "main",
  REMOTE_PATH: "/home/vennro/infrastructure",
  REMOTE_MAKE_TARGET: "init",
  DOCKERHUB_USERNAME: "",
  DOCKERHUB_PASSWORD: "",
  GIT_FORCE: "false",
};

const action = process.argv[2] || "";
const options = parseArgs(process.argv.slice(3));

try {
  switch (action) {
    case "init":
      initConfig();
      break;
    case "config":
      setConfigValue();
      break;
    case "setup":
      setup();
      break;
    default:
      usage();
      process.exit(1);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function initConfig() {
  if (existsSync(configFile)) {
    console.log(`Ansible config already exists: ${displayPath(configFile)}`);
    return;
  }

  mkdirSync(path.dirname(configFile), { recursive: true });
  writeJson(configFile, defaultConfig);
  console.log(`Created Ansible config: ${displayPath(configFile)}`);
}

function setConfigValue() {
  requireInitializedConfig();
  const param = required(input(options, "PARAM"), "PARAM is required");
  assert(
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(param),
    "PARAM must be a valid Ansible variable name",
  );
  assert(Object.hasOwn(process.env, "VALUE"), "VALUE is required");

  const config = readConfig();
  config[param] = process.env.VALUE ?? "";
  writeJson(configFile, config);
  console.log(`Updated Ansible config variable: ${param}`);
}

function setup() {
  requireInitializedConfig();
  const server = getServer(readId(input(options, "ID")));
  const inventoryFile = writeInventory(server);
  const args = [
    ...composeArgs("run", "--rm", "ansible"),
    "-i",
    `/runtime/${path.basename(inventoryFile)}`,
    playbookPath,
    "--extra-vars",
    `@${containerConfigPath()}`,
  ];

  if (input(options, "TAGS")) args.push("--tags", input(options, "TAGS"));
  if (bool(input(options, "CHECK"))) args.push("--check");
  if (bool(input(options, "DIFF"))) args.push("--diff");

  run("docker", args);
}

function writeInventory(server) {
  mkdirSync(runtimeDir, { recursive: true });
  const inventoryFile = path.join(runtimeDir, `inventory-${server.id}.yml`);
  const hostVars = {
    ansible_connection: "ssh",
    ansible_host: server.host,
    ansible_port: Number(server.port),
    ansible_python_interpreter: "/usr/bin/python3",
    ansible_ssh_common_args: "-o StrictHostKeyChecking=no",
    ansible_user: server.user,
  };

  if (server.authType === "key") {
    hostVars.ansible_ssh_private_key_file = containerKeyPath(server);
  } else {
    assert(server.password, "SSH server PASSWORD is required for Ansible password auth");
    hostVars.ansible_password = server.password;
  }

  writeFileSync(inventoryFile, inventoryYaml(hostVars), "utf8");
  return inventoryFile;
}

function inventoryYaml(hostVars) {
  const rows = [
    "all:",
    "  children:",
    "    production:",
    "      hosts:",
    "        server:",
  ];

  for (const [key, value] of Object.entries(hostVars)) {
    rows.push(`          ${key}: ${JSON.stringify(value)}`);
  }

  return `${rows.join("\n")}\n`;
}

function containerKeyPath(server) {
  assert(server.keyPath, "SSH server KEY_PATH is required for Ansible key auth");
  const expanded = expandHome(server.keyPath);
  const homeSshDir = path.join(process.env.HOME || "", ".ssh");
  const relative = path.relative(homeSshDir, expanded);
  assert(
    !relative.startsWith("..") && !path.isAbsolute(relative),
    "Ansible key auth requires KEY_PATH inside ~/.ssh because the container mounts ~/.ssh read-only",
  );
  return path.posix.join("/root/.ssh", relative.split(path.sep).join("/"));
}

function containerConfigPath() {
  const relative = path.relative(configDir, configFile);
  assert(
    !relative.startsWith("..") && !path.isAbsolute(relative),
    "Ansible setup requires config file inside config/",
  );
  return path.posix.join("/config", relative.split(path.sep).join("/"));
}

function composeArgs(...args) {
  const compose = ["compose"];
  if (existsSync(path.join(rootDir, ".env"))) {
    compose.push("--env-file", ".env");
  }

  return [
    ...compose,
    "-f",
    composeFile,
    "--profile",
    "deploy",
    ...args,
  ];
}

function readConfig() {
  const config = JSON.parse(readFileSync(configFile, "utf8"));
  assert(
    config && typeof config === "object" && !Array.isArray(config),
    "Ansible config must be a JSON object",
  );
  return config;
}

function writeJson(file, payload) {
  writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function requireInitializedConfig() {
  if (existsSync(configFile)) return;
  throw new Error(`Ansible config is missing: ${displayPath(configFile)}. Run make init.`);
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: rootDir, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

function displayPath(file) {
  const relative = path.relative(rootDir, file);
  return relative.startsWith("..") ? file : relative;
}

function usage() {
  console.log("Usage:");
  console.log("  make init");
  console.log("  make ansible-config PARAM=DOCKERHUB_USERNAME VALUE=vennro");
  console.log("  make ansible-setup ID=1");
  printJson({ defaultConfig });
}
