import { assert, body, sendJson } from "./http.mjs";
import { isNginxShellSession, stopNginxShell, writeNginxShellInput } from "./modules/nginx/shell.mjs";

export async function shellInput(req, res) {
  const payload = await body(req);
  const sessionId = payload.sessionId;

  assert(isNginxShellSession(sessionId), "Unknown shell session");
  writeNginxShellInput(sessionId, String(payload.input || ""));
  sendJson(res, 200, { ok: true });
}

export async function shellStop(req, res) {
  const payload = await body(req);
  const sessionId = payload.sessionId;

  assert(isNginxShellSession(sessionId), "Unknown shell session");
  stopNginxShell(sessionId);
  sendJson(res, 200, { ok: true });
}
