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
  await assertExportInput({ container, database, filePath, password, user });
  await assertRunningContainer(container);
  await exportDump({ container, database, filePath, password, user });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function assertExportInput({
  container,
  database,
  filePath,
  password,
  user,
}) {
  assert(filePath, "Export file path is required");
  assert(database, "Postgres database name is required");
  assert(user, "Postgres user is required");
  assert(password, "Postgres password is required");
  assertValidDatabaseName(database);
  assertValidUserName(user);
  assertValidContainerName(container);
  assert(
    isSupportedDumpFile(filePath),
    "Only .sql, .sql.gz and .dump exports are supported",
  );
}

async function exportDump({ container, database, filePath, password, user }) {
  await mkdir(path.dirname(filePath), { recursive: true });
  console.log(`Exporting ${database} from ${container} into ${filePath}`);

  const customFormat = filePath.endsWith(".dump");
  const args = [
    "exec",
    "-e",
    `PGPASSWORD=${password}`,
    container,
    "pg_dump",
    "-U",
    user,
    "-d",
    database,
  ];

  if (customFormat) args.push("-Fc");
  else args.push("--clean", "--if-exists");

  const pgDump = spawn("docker", args, {
    stdio: ["ignore", "pipe", "inherit"],
  });
  const exitPromise = waitForExit(pgDump);
  const output = createWriteStream(filePath, { flags: "w" });

  try {
    if (filePath.endsWith(".sql.gz"))
      await pipeline(pgDump.stdout, createGzip(), output);
    else await pipeline(pgDump.stdout, output);
  } catch (error) {
    pgDump.kill("SIGTERM");
    throw error;
  }

  const code = await exitPromise;
  assert(code === 0, `Postgres export failed with exit code ${code}`);
  console.log("Postgres export completed");
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
