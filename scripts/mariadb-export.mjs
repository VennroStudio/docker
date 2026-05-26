#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";

const args = parseArgs(process.argv.slice(2));
const filePath = args.file;
const database = args.database;
const container = args.container || "mariadb-container";
const password =
  args["root-password"] ||
  process.env.MYSQL_ROOT_PASSWORD ||
  (await readDotEnvValue("MYSQL_ROOT_PASSWORD"));

try {
  await assertExportInput({ container, database, filePath, password });
  await exportDump({ container, database, filePath, password });
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

async function assertExportInput({ container, database, filePath, password }) {
  assert(filePath, "Export file path is required");
  assert(database, "Database name is required");
  assert(password, "MYSQL_ROOT_PASSWORD is required");
  assert(/^[A-Za-z0-9_$.-]+$/.test(database), "Invalid database name");
  assert(/^[A-Za-z0-9_.-]+$/.test(container), "Invalid MariaDB container name");
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
