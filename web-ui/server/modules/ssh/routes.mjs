import { streamSse } from "../../command-runner.mjs";
import { assert, body, sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

const streamRoutes = new Set([
  "/api/stream/ssh-add",
  "/api/stream/ssh-update",
  "/api/stream/ssh-remove",
  "/api/stream/ssh-connect",
  "/api/stream/ssh-key-generate",
  "/api/stream/ssh-key-push",
]);

export function isSshStreamRoute(req) {
  const url = new URL(req.url, "http://localhost");
  return streamRoutes.has(url.pathname);
}

export async function sshStreamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");
  const payload = req.method === "POST" ? await body(req) : {};
  const param = (key) => payload?.[key] ?? url.searchParams.get(key);

  if (url.pathname === "/api/stream/ssh-add") {
    return streamSse(req, res, "make", ["ssh-add", ...serverArgs(payload)], process.env);
  }

  if (url.pathname === "/api/stream/ssh-update") {
    const id = validateId(param("id"));
    return streamSse(req, res, "make", ["ssh-update", `ID=${id}`, ...serverArgs(payload)], process.env);
  }

  if (url.pathname === "/api/stream/ssh-remove") {
    const id = validateId(param("id"));
    return streamSse(req, res, "make", ["ssh-remove", `ID=${id}`], process.env);
  }

  if (url.pathname === "/api/stream/ssh-connect") {
    const id = validateId(param("id"));
    return streamSse(req, res, "make", ["ssh-connect-ui", `ID=${id}`], process.env, { interactive: true });
  }

  if (url.pathname === "/api/stream/ssh-key-generate") {
    const id = validateId(param("id"));
    return streamSse(req, res, "make", ["ssh-key-generate", `ID=${id}`, ...keyArgs(payload)], process.env);
  }

  if (url.pathname === "/api/stream/ssh-key-push") {
    const id = validateId(param("id"));
    return streamSse(req, res, "make", ["ssh-key-push-ui", `ID=${id}`], process.env, { interactive: true });
  }

  throw new Error("Unknown SSH stream route");
}

export async function sshServers(_req, res) {
  sendJson(res, 200, JSON.parse(await execMake(["ssh-list"])));
}

function serverArgs(payload) {
  return [
    valueArg("NAME", validateText(payload.name, "NAME is required")),
    valueArg("HOST", validateHost(payload.host)),
    valueArg("PORT", validatePort(payload.port || "22")),
    valueArg("USER", validateText(payload.user, "USER is required")),
    valueArg("AUTH_TYPE", validateEnum(payload.authType || "password", ["password", "key"], "Invalid AUTH_TYPE")),
    valueArg(
      "PASSWORD_MODE",
      validateEnum(payload.passwordMode || "manual", ["manual", "sshpass"], "Invalid PASSWORD_MODE"),
    ),
    valueArg("PASSWORD", payload.password || ""),
    valueArg("KEY_PATH", payload.keyPath || ""),
  ];
}

function keyArgs(payload) {
  return [
    payload.keyPath ? valueArg("KEY_PATH", payload.keyPath) : null,
    payload.comment ? valueArg("COMMENT", payload.comment) : null,
    payload.force ? "FORCE=1" : null,
  ].filter(Boolean);
}

function valueArg(key, value) {
  return `${key}=${String(value ?? "")}`;
}

function validateId(value) {
  assert(/^\d+$/.test(String(value || "")) && Number(value) > 0, "Invalid ID");
  return String(value);
}

function validatePort(value) {
  assert(/^\d+$/.test(String(value || "")), "Invalid PORT");
  const port = Number(value);
  assert(port >= 1 && port <= 65535, "Invalid PORT");
  return String(port);
}

function validateHost(value) {
  const host = validateText(value, "HOST is required");
  assert(!/\s/.test(host), "HOST must not contain whitespace");
  return host;
}

function validateText(value, message) {
  assert(typeof value === "string" && value.trim(), message);
  return value.trim();
}

function validateEnum(value, allowed, message) {
  assert(allowed.includes(value), message);
  return value;
}
