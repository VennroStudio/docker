import { streamSse } from "../../command-runner.mjs";
import { assert, body, sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

const utilityStreamRoutes = new Set([
  "/api/stream/archive-create",
  "/api/stream/archive-extract",
  "/api/stream/archive-delete",
]);

export function isUtilitiesStreamRoute(req) {
  const url = new URL(req.url, "http://localhost");
  return utilityStreamRoutes.has(url.pathname);
}

export async function utilitiesStreamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");
  const payload = req.method === "POST" ? await body(req) : {};
  const param = (key) => payload?.[key] ?? url.searchParams.get(key);

  if (url.pathname === "/api/stream/archive-create") {
    const name = validateArchiveBaseName(param("name"));
    const folder = validatePathValue(param("folder"), "FOLDER is required");
    return streamSse(req, res, "make", ["archive", `NAME=${name}`, `FOLDER=${folder}`], process.env);
  }

  if (url.pathname === "/api/stream/archive-extract") {
    const name = validateArchiveFileName(param("name"));
    const dest = validatePathValue(param("dest"), "DEST is required");
    return streamSse(req, res, "make", ["unarchive", `NAME=${name}`, `DEST=${dest}`], process.env);
  }

  if (url.pathname === "/api/stream/archive-delete") {
    const name = validateArchiveFileName(param("name"));
    return streamSse(req, res, "make", ["archive-delete", `NAME=${name}`], process.env);
  }

  throw new Error("Unknown utilities stream route");
}

export async function archives(_req, res) {
  sendJson(res, 200, JSON.parse(await execMake(["archive-list"])));
}

function validateArchiveBaseName(value) {
  assert(/^[A-Za-z0-9._-]+$/.test(value || ""), "Invalid NAME");
  return value;
}

function validateArchiveFileName(value) {
  assert(/^[A-Za-z0-9._-]+\.t(ar\.)?gz$/.test(value || ""), "Invalid NAME");
  return value;
}

function validatePathValue(value, message) {
  assert(typeof value === "string" && value.trim(), message);
  return value.trim();
}
