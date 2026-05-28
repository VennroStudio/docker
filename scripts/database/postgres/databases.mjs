#!/usr/bin/env node
import { spawn } from "node:child_process";
import {
  assert,
  assertRunningContainer,
  assertValidContainerName,
  assertValidDatabaseName,
  assertValidUserName,
  getRuntimeEnv,
  parseArgs,
  resolveDatabaseName,
  resolvePostgresTarget,
} from "./common.mjs";

const systemDatabases = new Set(["postgres", "template0", "template1"]);
const maintenanceDatabase = "postgres";

const [command, ...argv] = process.argv.slice(2);
const args = parseArgs(argv);
const env = await getRuntimeEnv();

try {
  assert(
    ["create", "drop", "list"].includes(command),
    "Usage: node scripts/database/postgres/databases.mjs list|create|drop",
  );

  const target = await resolvePostgresTarget(args, env);
  assertValidContainerName(target.container);
  assertValidUserName(target.user);
  assert(target.password, "Postgres password is required");
  await assertRunningContainer(target.container);

  if (command === "list") {
    const databases = await listDatabases(target);
    console.log(databases.join("\n"));
    process.exit(0);
  }

  const database = resolveDatabaseName(args, env, target);
  assertValidDatabaseName(database);
  assert(
    !systemDatabases.has(database),
    `Refusing to ${command} system database ${database}`,
  );

  if (command === "create")
    await executeSql(target, `CREATE DATABASE ${quoteIdentifier(database)};`);
  if (command === "drop")
    await executeSql(
      target,
      `DROP DATABASE IF EXISTS ${quoteIdentifier(database)};`,
    );

  console.log(
    `Postgres database ${database} ${command === "create" ? "created" : "dropped"}`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function listDatabases(target) {
  const { stdout } = await executeSql(
    target,
    "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname;",
  );

  return stdout
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter((name) => name && !systemDatabases.has(name));
}

async function executeSql(target, sql) {
  const result = await collect("docker", [
    "exec",
    "-e",
    `PGPASSWORD=${target.password}`,
    target.container,
    "psql",
    "-U",
    target.user,
    "-d",
    maintenanceDatabase,
    "-At",
    "-c",
    sql,
  ]);

  assert(
    result.code === 0,
    result.stderr.trim() ||
      `Postgres command failed with exit code ${result.code}`,
  );
  return result;
}

function quoteIdentifier(identifier) {
  return `"${String(identifier).replaceAll('"', '""')}"`;
}

function collect(commandName, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(commandName, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });
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
