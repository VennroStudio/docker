import { body, sendJson } from "./http.mjs";
import { projectRoot } from "./config.mjs";
import { execMake } from "./make-runner.mjs";

export async function settings(req, res) {
  if (req.method === "GET") {
    return sendJson(res, 200, await readSettings());
  }

  if (req.method === "PUT") {
    const nextSettings = await body(req);
    await writeSettings(nextSettings);
    return sendJson(res, 200, await readSettings());
  }

  sendJson(res, 405, { ok: false, output: "Method not allowed" });
}

export async function generateEnv(_req, res) {
  sendJson(res, 501, { ok: false, output: "Env generation is not implemented in the new console flow" });
}

async function readSettings() {
  const output = await execMake(["settings-show"]);

  return {
    exists: true,
    path: `${projectRoot}/config/settings.json`,
    settings: JSON.parse(output),
  };
}

async function writeSettings(nextSettings) {
  const current = (await readSettings()).settings;
  const changes = diffSettings(current, nextSettings);

  for (const [key, value] of changes) {
    await execMake(["settings-set", `KEY=${key}`, `VALUE=${String(value ?? "")}`]);
  }
}

function diffSettings(current, next, prefix = "") {
  const changes = [];
  const keys = new Set([...Object.keys(current || {}), ...Object.keys(next || {})]);

  for (const key of keys) {
    const path = prefix ? `${prefix}.${key}` : key;
    const currentValue = current?.[key];
    const nextValue = next?.[key];

    if (isPlainObject(currentValue) || isPlainObject(nextValue)) {
      changes.push(...diffSettings(currentValue || {}, nextValue || {}, path));
    } else if (currentValue !== nextValue) {
      changes.push([path, nextValue]);
    }
  }

  return changes;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
