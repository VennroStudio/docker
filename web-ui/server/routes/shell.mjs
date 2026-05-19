import { body, sendJson } from "../http.mjs";
import { stopShell, writeShellInput } from "../shell-sessions.mjs";

export async function shellInput(req, res) {
  const payload = await body(req);
  writeShellInput(payload.sessionId, String(payload.input || ""));
  sendJson(res, 200, { ok: true });
}

export async function shellStop(req, res) {
  const payload = await body(req);
  stopShell(payload.sessionId);
  sendJson(res, 200, { ok: true });
}
