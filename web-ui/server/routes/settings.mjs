import { body, sendJson } from "../http.mjs";
import { readSettings, writeEnvFromSettings, writeSettings } from "../settings-store.mjs";

export async function settings(req, res) {
  if (req.method === "GET") {
    return sendJson(res, 200, await readSettings());
  }

  if (req.method === "PUT") {
    return sendJson(res, 200, await writeSettings(await body(req)));
  }

  sendJson(res, 405, { ok: false, output: "Method not allowed" });
}

export async function generateEnv(_req, res) {
  return sendJson(res, 200, await writeEnvFromSettings());
}
