import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const instancesPath = path.join(process.cwd(), "docker/mariadb/instances.json");

export function parseArgs(argv) {
  const result = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      result[key] = "1";
      continue;
    }

    result[key] = next;
    index += 1;
  }

  return result;
}

export async function getRuntimeEnv() {
  return { ...(await readDotEnv()), ...process.env };
}

export function resolveDumpFilePath(args, env) {
  return args.file || env.FILE || env.DUMP_FILE;
}

export function resolveDatabaseName(args, env) {
  return args.database || env.DATABASE;
}

export async function resolveMariaDbTarget(args, env) {
  const instances = await readMariaDbInstances();
  const name = args.name || env.MARIADB_NAME || env.NAME;
  const container = args.container || env.MARIADB_CONTAINER || env.CONTAINER;
  const explicitRootPassword =
    args["root-password"] || env.MARIADB_ROOT_PASSWORD || env.ROOT_PASSWORD;

  if (name) {
    const instance = instances.find((item) => item.name === name);
    assert(instance, `MariaDB instance ${name} is not configured`);
    return {
      container: instance.container,
      password:
        explicitRootPassword ||
        instance.rootPassword ||
        env.MYSQL_ROOT_PASSWORD,
    };
  }

  if (container) {
    const instance = instances.find((item) => item.container === container);
    return {
      container,
      password:
        explicitRootPassword ||
        instance?.rootPassword ||
        env.MYSQL_ROOT_PASSWORD,
    };
  }

  assert(
    instances.length === 1,
    "MariaDB target is required. Pass NAME=instance-name or CONTAINER=container-name",
  );

  return {
    container: instances[0].container,
    password:
      explicitRootPassword ||
      instances[0].rootPassword ||
      env.MYSQL_ROOT_PASSWORD,
  };
}

export async function assertRunningContainer(container) {
  const { code, stdout, stderr } = await collect("docker", [
    "inspect",
    "-f",
    "{{.State.Running}}",
    container,
  ]);

  assert(
    code === 0,
    stderr.trim() || `MariaDB container ${container} is not found`,
  );
  assert(
    stdout.trim() === "true",
    `MariaDB container ${container} must be running`,
  );
}

export function assertValidDatabaseName(database) {
  assert(/^[A-Za-z0-9_$.-]+$/.test(database || ""), "Invalid database name");
}

export function assertValidContainerName(container) {
  assert(
    /^[A-Za-z0-9_.-]+$/.test(container || ""),
    "Invalid MariaDB container name",
  );
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readDotEnv() {
  try {
    const envFile = await readFile(".env", "utf8");
    return Object.fromEntries(
      envFile
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line
            .slice(index + 1)
            .trim()
            .replace(/^["']|["']$/g, "");
          return [key, value];
        }),
    );
  } catch {
    return {};
  }
}

async function readMariaDbInstances() {
  try {
    return JSON.parse(await readFile(instancesPath, "utf8"));
  } catch {
    return [];
  }
}

function collect(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({
        code,
        stderr: Buffer.concat(stderr).toString("utf8"),
        stdout: Buffer.concat(stdout).toString("utf8"),
      });
    });
  });
}
