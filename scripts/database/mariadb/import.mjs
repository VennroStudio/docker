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
  getRuntimeEnv,
  parseArgs,
  resolveDatabaseName,
  resolveDumpFilePath,
  resolveMariaDbTarget,
} from "./common.mjs";

const args = parseArgs(process.argv.slice(2));
const env = await getRuntimeEnv();
const filePath = resolveDumpFilePath(args, env);
const database = resolveDatabaseName(args, env);

try {
  const { container, password } = await resolveMariaDbTarget(args, env);
  await assertImportInput({ container, database, filePath, password });
  await assertRunningContainer(container);
  await importDump({ container, database, filePath, password });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function assertImportInput({ container, database, filePath, password }) {
  assert(filePath, "Dump file path is required");
  assert(database, "Database name is required");
  assert(password, "MariaDB root password is required");
  assertValidDatabaseName(database);
  assertValidContainerName(container);
  assert(
    filePath.endsWith(".sql") || filePath.endsWith(".sql.gz"),
    "Only .sql and .sql.gz dumps are supported",
  );

  const file = await stat(filePath).catch(() => null);
  assert(file?.isFile(), "Dump path must point to a file");
}

async function importDump({ container, database, filePath, password }) {
  console.log(`Importing ${filePath} into ${database} on ${container}`);

  const mysql = spawn(
    "docker",
    ["exec", "-i", container, "mysql", "-u", "root", `-p${password}`, database],
    {
      stdio: ["pipe", "inherit", "inherit"],
    },
  );
  const exitPromise = waitForExit(mysql);
  const source = createReadStream(filePath);

  try {
    if (filePath.endsWith(".sql.gz"))
      await pipeline(source, createGunzip(), mysql.stdin);
    else await pipeline(source, mysql.stdin);
  } catch (error) {
    mysql.kill("SIGTERM");
    throw error;
  }

  const code = await exitPromise;
  assert(code === 0, `MariaDB import failed with exit code ${code}`);
  console.log("MariaDB import completed");
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
}
