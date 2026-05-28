#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import {
  assert,
  assertRunningContainer,
  assertValidContainerName,
  assertValidDatabaseName,
  assertValidUserName,
  getRuntimeEnv,
  parseArgs,
  resolveDumpFilePath,
  resolvePostgresTarget,
} from "./common.mjs";

const args = parseArgs(process.argv.slice(2));
const env = await getRuntimeEnv();
const filePath = resolveDumpFilePath(args, env);

try {
  const { container, database, password, user } = await resolvePostgresTarget(
    args,
    env,
  );
  await assertImportInput({ container, database, filePath, password, user });
  await assertRunningContainer(container);
  await importDump({ container, database, filePath, password, user });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function assertImportInput({
  container,
  database,
  filePath,
  password,
  user,
}) {
  assert(filePath, "Dump file path is required");
  assert(database, "Postgres database name is required");
  assert(user, "Postgres user is required");
  assert(password, "Postgres password is required");
  assertValidDatabaseName(database);
  assertValidUserName(user);
  assertValidContainerName(container);
  assert(
    isSupportedDumpFile(filePath),
    "Only .sql, .sql.gz and .dump imports are supported",
  );

  const file = await stat(filePath).catch(() => null);
  assert(file?.isFile(), "Dump path must point to a file");
}

async function importDump({ container, database, filePath, password, user }) {
  const customFormat = filePath.endsWith(".dump");
  const command = customFormat ? "pg_restore" : "psql";
  const args = customFormat
    ? [
        "exec",
        "-i",
        "-e",
        `PGPASSWORD=${password}`,
        container,
        command,
        "--clean",
        "--if-exists",
        "-U",
        user,
        "-d",
        database,
      ]
    : [
        "exec",
        "-i",
        "-e",
        `PGPASSWORD=${password}`,
        container,
        command,
        "-v",
        "ON_ERROR_STOP=1",
        "-U",
        user,
        "-d",
        database,
      ];

  console.log(`Importing ${filePath} into ${database} on ${container}`);

  const child = spawn("docker", args, {
    stdio: ["pipe", "inherit", "inherit"],
  });
  const exitPromise = waitForExit(child);
  const source = createReadStream(filePath);

  try {
    if (filePath.endsWith(".sql.gz"))
      await pipeline(source, createGunzip(), child.stdin);
    else await pipeline(source, child.stdin);
  } catch (error) {
    child.kill("SIGTERM");
    throw error;
  }

  const code = await exitPromise;
  assert(code === 0, `Postgres import failed with exit code ${code}`);
  console.log("Postgres import completed");
}

function isSupportedDumpFile(filePath) {
  return (
    filePath.endsWith(".sql") ||
    filePath.endsWith(".sql.gz") ||
    filePath.endsWith(".dump")
  );
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
}
