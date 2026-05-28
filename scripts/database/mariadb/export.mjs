#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
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
  await assertExportInput({ container, database, filePath, password });
  await assertRunningContainer(container);
  await exportDump({ container, database, filePath, password });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function assertExportInput({ container, database, filePath, password }) {
  assert(filePath, "Export file path is required");
  assert(database, "Database name is required");
  assert(password, "MariaDB root password is required");
  assertValidDatabaseName(database);
  assertValidContainerName(container);
  assert(
    filePath.endsWith(".sql") || filePath.endsWith(".sql.gz"),
    "Only .sql and .sql.gz exports are supported",
  );
}

async function exportDump({ container, database, filePath, password }) {
  await mkdir(path.dirname(filePath), { recursive: true });
  console.log(`Exporting ${database} from ${container} into ${filePath}`);

  const mysqldump = spawn(
    "docker",
    ["exec", container, "mysqldump", "-u", "root", `-p${password}`, database],
    {
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
  const exitPromise = waitForExit(mysqldump);
  const output = createWriteStream(filePath, { flags: "w" });

  try {
    if (filePath.endsWith(".sql.gz"))
      await pipeline(mysqldump.stdout, createGzip(), output);
    else await pipeline(mysqldump.stdout, output);
  } catch (error) {
    mysqldump.kill("SIGTERM");
    throw error;
  }

  const code = await exitPromise;
  assert(code === 0, `MariaDB export failed with exit code ${code}`);
  console.log("MariaDB export completed");
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
}
