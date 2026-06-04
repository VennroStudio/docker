import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { assert, parseArgs } from "../../common/cli.mjs";
import { getRuntimeEnv } from "../../common/env.mjs";
import { collect } from "../../common/process.mjs";

const instancesPath = path.join(
  process.cwd(),
  "docker/postgres/instances.json",
);

export { assert, getRuntimeEnv, parseArgs };

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

async function readPostgresInstances() {
  await requireInitializedInstancesFile();
  return JSON.parse(await readFile(instancesPath, "utf8"));
}

async function requireInitializedInstancesFile() {
  try {
    await access(instancesPath);
  } catch {
    throw new Error(
      `Postgres instances file is missing: ${path.relative(process.cwd(), instancesPath)}. Run make init.`,
    );
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
