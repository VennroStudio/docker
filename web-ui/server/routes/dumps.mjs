import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { sendJson } from "../http.mjs";

const dumpsRoot = path.resolve("dumps");

export async function dumps(_req, res) {
  try {
    const files = await findDumpFiles(dumpsRoot);
    sendJson(res, 200, { dumps: files });
  } catch (error) {
    if (error?.code === "ENOENT") return sendJson(res, 200, { dumps: [] });
    throw error;
  }
}

async function findDumpFiles(root, base = root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(root, entry.name);

      if (entry.isDirectory()) return findDumpFiles(fullPath, base);
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
  return fileName.endsWith(".sql") || fileName.endsWith(".sql.gz");
}
