import { assert, body, sendJson } from "./http.mjs";
import { isCommandSession, stopCommandSession, writeCommandInput } from "./command-runner.mjs";
import { isNginxShellSession, stopNginxShell, writeNginxShellInput } from "./modules/nginx/shell.mjs";
import {
  isDatabaseShellSession,
  stopDatabaseShell,
  writeDatabaseShellInput,
} from "./modules/database/shell.mjs";
import { isRedisShellSession, stopRedisShell, writeRedisShellInput } from "./modules/redis/shell.mjs";
import { isMinioShellSession, stopMinioShell, writeMinioShellInput } from "./modules/minio/shell.mjs";
import { isRegistryShellSession, stopRegistryShell, writeRegistryShellInput } from "./modules/registry/shell.mjs";

export async function shellInput(req, res) {
  const payload = await body(req);
  const sessionId = payload.sessionId;

  assert(
    isNginxShellSession(sessionId)
      || isDatabaseShellSession(sessionId)
      || isRedisShellSession(sessionId)
      || isMinioShellSession(sessionId)
      || isRegistryShellSession(sessionId)
      || isCommandSession(sessionId),
    "Unknown shell session",
  );
  if (isCommandSession(sessionId)) writeCommandInput(sessionId, String(payload.input || ""));
  else if (isRegistryShellSession(sessionId)) writeRegistryShellInput(sessionId, String(payload.input || ""));
  else if (isMinioShellSession(sessionId)) writeMinioShellInput(sessionId, String(payload.input || ""));
  else if (isRedisShellSession(sessionId)) writeRedisShellInput(sessionId, String(payload.input || ""));
  else if (isDatabaseShellSession(sessionId)) writeDatabaseShellInput(sessionId, String(payload.input || ""));
  else writeNginxShellInput(sessionId, String(payload.input || ""));
  sendJson(res, 200, { ok: true });
}

export async function shellStop(req, res) {
  const payload = await body(req);
  const sessionId = payload.sessionId;

  assert(
    isNginxShellSession(sessionId)
      || isDatabaseShellSession(sessionId)
      || isRedisShellSession(sessionId)
      || isMinioShellSession(sessionId)
      || isRegistryShellSession(sessionId)
      || isCommandSession(sessionId),
    "Unknown shell session",
  );
  if (isCommandSession(sessionId)) stopCommandSession(sessionId);
  else if (isRegistryShellSession(sessionId)) stopRegistryShell(sessionId);
  else if (isMinioShellSession(sessionId)) stopMinioShell(sessionId);
  else if (isRedisShellSession(sessionId)) stopRedisShell(sessionId);
  else if (isDatabaseShellSession(sessionId)) stopDatabaseShell(sessionId);
  else stopNginxShell(sessionId);
  sendJson(res, 200, { ok: true });
}
