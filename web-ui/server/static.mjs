import { readFile } from "node:fs/promises";
import path from "node:path";
import { staticRoot, staticTypes } from "./config.mjs";

export async function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : new URL(req.url, "http://localhost").pathname;
  const requestedPath = path.join(staticRoot, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
  const filePath = isInsideRoot(requestedPath) ? requestedPath : path.join(staticRoot, "index.html");
  let servedPath = filePath;
  const body = await readFile(filePath).catch(() => {
    servedPath = path.join(staticRoot, "index.html");
    return readFile(servedPath);
  });

  res.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": staticTypes[path.extname(servedPath)] || "application/octet-stream",
  });

  if (req.method === "HEAD") return res.end();
  res.end(body);
}

function isInsideRoot(filePath) {
  const relative = path.relative(staticRoot, filePath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
}
