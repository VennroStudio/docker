import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { assert, parseArgs } from "../../common/cli.mjs";
import { getRuntimeEnv } from "../../common/env.mjs";
import { collect } from "../../common/process.mjs";

const instancesPath = path.join(process.cwd(), "docker/mariadb/instances.json");
export { assert, getRuntimeEnv, parseArgs };

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

async function readMariaDbInstances() {
  await requireInitializedInstancesFile();
  return JSON.parse(await readFile(instancesPath, "utf8"));
}

async function requireInitializedInstancesFile() {
  try {
    await access(instancesPath);
  } catch {
    throw new Error(
      `MariaDB instances file is missing: ${path.relative(process.cwd(), instancesPath)}. Run make init.`,
    );
  }
}
