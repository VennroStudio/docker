#!/usr/bin/env node
import { collect } from "../../common/process.mjs";
import {
  assert,
  assertRunningContainer,
  assertValidContainerName,
  assertValidDatabaseName,
  getRuntimeEnv,
  parseArgs,
  resolveDatabaseName,
  resolveMariaDbTarget,
} from "./common.mjs";

const systemDatabases = new Set([
  "information_schema",
  "mysql",
  "performance_schema",
  "sys",
]);

const [command, ...argv] = process.argv.slice(2);
const args = parseArgs(argv);
const env = await getRuntimeEnv();

try {
  assert(
    ["create", "drop", "list"].includes(command),
    "Usage: node scripts/database/mariadb/databases.mjs list|create|drop",
  );

  const { container, password } = await resolveMariaDbTarget(args, env);
  assertValidContainerName(container);
  assert(password, "MariaDB root password is required");
  await assertRunningContainer(container);

  if (command === "list") {
    const databases = await listDatabases({ container, password });
    console.log(databases.join("\n"));
    process.exit(0);
  }

  const database = resolveDatabaseName(args, env);
  assertValidDatabaseName(database);
  assert(
    !systemDatabases.has(database),
    `Refusing to ${command} system database ${database}`,
  );

  if (command === "create")
    await executeSql({
      container,
      password,
      sql: `CREATE DATABASE ${quoteIdentifier(database)};`,
    });
  if (command === "drop")
    await executeSql({
      container,
      password,
      sql: `DROP DATABASE IF EXISTS ${quoteIdentifier(database)};`,
    });

  console.log(
    `MariaDB database ${database} ${command === "create" ? "created" : "dropped"}`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function listDatabases({ container, password }) {
  const { stdout } = await executeSql({
    container,
    password,
    sql: "SHOW DATABASES;",
  });

  return stdout
    .split(/\r?\n/)
    .map((name) => name.trim())
    .filter((name) => name && !systemDatabases.has(name));
}

async function executeSql({ container, password, sql }) {
  const result = await collect("docker", [
    "exec",
    container,
    "mysql",
    "-N",
    "-B",
    "-u",
    "root",
    `-p${password}`,
    "-e",
    sql,
  ]);

  assert(
    result.code === 0,
    result.stderr.trim() ||
      `MariaDB command failed with exit code ${result.code}`,
  );
  return result;
}

function quoteIdentifier(identifier) {
  return `\`${String(identifier).replaceAll("`", "``")}\``;
}
