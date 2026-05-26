#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";

const args = parseArgs(process.argv.slice(2));
const filePath = args.file;
const database = args.database;
const container = args.container || "mariadb-container";
const password =
  args["root-password"] ||
  process.env.MYSQL_ROOT_PASSWORD ||
  (await readDotEnvValue("MYSQL_ROOT_PASSWORD"));

try {
  await assertImportInput({ container, database, filePath, password });
  await importDump({ container, database, filePath, password });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

function parseArgs(argv) {
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

async function readDotEnvValue(key) {
  try {
    const envFile = await readFile(".env", "utf8");
    const line = envFile
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .find(
        (entry) =>
          entry && !entry.startsWith("#") && entry.startsWith(`${key}=`),
      );

    if (!line) return undefined;

    const value = line.slice(key.length + 1).trim();
    return value.replace(/^["']|["']$/g, "");
  } catch {
    return undefined;
  }
}

async function assertImportInput({ container, database, filePath, password }) {
  assert(filePath, "Dump file path is required");
  assert(database, "Database name is required");
  assert(password, "MYSQL_ROOT_PASSWORD is required");
  assert(/^[A-Za-z0-9_$.-]+$/.test(database), "Invalid database name");
  assert(/^[A-Za-z0-9_.-]+$/.test(container), "Invalid MariaDB container name");
  assert(
    filePath.endsWith(".sql") || filePath.endsWith(".sql.gz"),
    "Only .sql and .sql.gz dumps are supported",
  );

  const file = await stat(filePath);
  assert(file.isFile(), "Dump path must point to a file");
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
