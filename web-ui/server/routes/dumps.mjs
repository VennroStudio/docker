import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { sendJson } from "../http.mjs";

const dumpRoots = {
  mariadb: path.resolve("dumps/mariadb"),
  postgres: path.resolve("dumps/postgres"),
};

export async function dumps(req, res) {
  const url = new URL(req.url, "http://localhost");
  const engine = url.searchParams.get("engine") || "mariadb";
  const root = dumpRoots[engine];

  if (!root) return sendJson(res, 400, { ok: false, output: "Unknown dump engine" });

  try {
    const files = await findDumpFiles(root);
    sendJson(res, 200, { dumps: files });
  } catch (error) {
    if (error?.code === "ENOENT") return sendJson(res, 200, { dumps: [] });
    throw error;
  }
}

async function findDumpFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
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
