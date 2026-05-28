#!/usr/bin/env node
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { parseArgs, printJson } from "./status-common.mjs";

const dumpRoots = {
  mariadb: "dumps/mariadb",
  postgres: "dumps/postgres",
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  const [command = "list", ...argv] = process.argv.slice(2);
  const options = parseArgs(argv);

  if (command !== "list") throw new Error("Usage: node scripts/database/dumps.mjs list --engine mariadb|postgres");

  const engine = options.engine || process.env.ENGINE;
  const root = dumpRoots[engine];
  if (!root) throw new Error("ENGINE must be mariadb or postgres");

  printJson({ dumps: await findDumpFiles(path.resolve(root)) });
}

async function findDumpFiles(root) {
  let entries = [];

  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(root, entry.name);

      if (entry.isDirectory()) return findDumpFiles(fullPath);
      if (!entry.isFile() || !isDumpFile(entry.name)) return [];

      const file = await stat(fullPath);
      const relativePath = path.relative(process.cwd(), fullPath);

      return [
        {
          modifiedAt: file.mtime.toISOString(),
          name: entry.name,
          path: relativePath,
          size: file.size,
        },
      ];
    }),
  );

  return files.flat().sort((left, right) => left.path.localeCompare(right.path));
}

function isDumpFile(fileName) {
  return fileName.endsWith(".sql") || fileName.endsWith(".sql.gz") || fileName.endsWith(".dump");
}
