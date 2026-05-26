import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const instancesPath = path.join(
  process.cwd(),
  "docker/postgres/instances.json",
);

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
  return (
    args.file ||
    env.FILE ||
    env.DUMP_FILE ||
    env.POSTGRES_DUMP_FILE ||
    joinDumpPath(env.POSTGRES_HOME_DUMP_PATH, env.POSTGRES_DUMP_NAME)
  );
}

export function resolveDatabaseName(args, env, instance) {
  return args.database || env.DATABASE || env.POSTGRES_DB || instance?.database;
}

export async function resolvePostgresTarget(args, env) {
  const instances = await readPostgresInstances();
  const name = args.name || env.POSTGRES_NAME || env.NAME;
  const container = args.container || env.POSTGRES_CONTAINER || env.CONTAINER;

  if (name) {
    const instance = instances.find((item) => item.name === name);
    assert(instance, `Postgres instance ${name} is not configured`);
    return targetFromInstance(instance, args, env);
  }

  if (container) {
    const instance = instances.find((item) => item.container === container);
    assert(instance, `Postgres container ${container} is not configured`);
    return targetFromInstance(instance, args, env);
  }

  assert(
    instances.length === 1,
    "Postgres target is required. Pass NAME=instance-name or CONTAINER=container-name",
  );

  return targetFromInstance(instances[0], args, env);
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
    stderr.trim() || `Postgres container ${container} is not found`,
  );
  assert(
    stdout.trim() === "true",
    `Postgres container ${container} must be running`,
  );
}

export function assertValidDatabaseName(database) {
  assert(
    /^[A-Za-z0-9_]+$/.test(database || ""),
    "Invalid Postgres database name",
  );
}

export function assertValidUserName(user) {
  assert(/^[A-Za-z0-9_]+$/.test(user || ""), "Invalid Postgres user name");
}

export function assertValidContainerName(container) {
  assert(
    /^[A-Za-z0-9_.-]+$/.test(container || ""),
    "Invalid Postgres container name",
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

async function readPostgresInstances() {
  try {
    return JSON.parse(await readFile(instancesPath, "utf8"));
  } catch {
    return [];
  }
}

function targetFromInstance(instance, args, env) {
  return {
    container: instance.container,
    database: resolveDatabaseName(args, env, instance),
    password: args.password || env.POSTGRES_PASSWORD || instance.password,
    user: args.user || env.POSTGRES_USER || instance.user,
  };
}

function joinDumpPath(root, fileName) {
  if (!root || !fileName) return undefined;
  if (path.isAbsolute(fileName)) return fileName;
  return path.join(root, fileName);
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
