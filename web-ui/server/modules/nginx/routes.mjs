import { stream, streamSse } from "../../command-runner.mjs";
import { commandMap } from "../../config.mjs";
import { assert, body, sendJson, validateDomain, validatePort, validateTarget } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import { hostCommand, proxyCommand, proxyDeleteCommand } from "./commands.mjs";
import { streamNginxShell } from "./shell.mjs";

const nginxContainer = "nginx-container";

export function isNginxStreamRoute(req) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") return isNginxCommand(url.searchParams.get("command"));
  if (["/api/stream/host", "/api/stream/proxy", "/api/stream/proxy-delete"].includes(url.pathname)) return true;
  return url.pathname === "/api/stream/shell" && url.searchParams.get("container") === nginxContainer;
}

export async function nginxStreamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");
  const payload = req.method === "POST" ? await body(req) : null;
  const param = (key) => payload?.[key] ?? url.searchParams.get(key);

  if (url.pathname === "/api/stream/run") {
    const commandId = param("command");
    assert(isNginxCommand(commandId), "Unknown nginx command");
    const entry = commandMap[commandId];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1), process.env);
  }

  if (url.pathname === "/api/stream/host") {
    const action = param("action");
    const domain = param("domain");
    assert(action === "add" || action === "remove", "Invalid host action");
    validateDomain(domain);
    const [command, args] = hostCommand(action, domain);
    return streamSse(req, res, command, args, process.env, { interactive: true });
  }

  if (url.pathname === "/api/stream/proxy") {
    const domain = param("domain");
    const target = param("target");
    const port = param("port");

    validateDomain(domain);
    validateTarget(target);
    validatePort(port);

    const [command, args] = proxyCommand({ domain, port, ssl: isTruthy(param("ssl")), target });
    return streamSse(req, res, command, args, process.env);
  }

  if (url.pathname === "/api/stream/proxy-delete") {
    const domain = param("domain");
    validateDomain(domain);
    const [command, args] = proxyDeleteCommand(domain);
    return streamSse(req, res, command, args, process.env);
  }

  if (url.pathname === "/api/stream/shell") {
    return streamNginxShell(req, res);
  }

  throw new Error("Unknown nginx stream route");
}

export async function host(req, res, action) {
  const { domain } = await body(req);
  validateDomain(domain);
  const [command, args] = hostCommand(action, domain);
  stream(res, command, args, process.env);
}

export async function proxy(req, res) {
  const { domain, port, ssl, target } = await body(req);
  validateDomain(domain);
  validateTarget(target);
  validatePort(port);
  const [command, args] = proxyCommand({ domain, port, ssl, target });
  stream(res, command, args, process.env);
}

export async function nginxStatus(_req, res) {
  const output = await execMake(["npm-status"]);
  sendJson(res, 200, JSON.parse(output));
}

function isTruthy(value) {
  return value === true || value === "1" || value === "true" || value === "on";
}

function isNginxCommand(commandId) {
  return typeof commandId === "string" && commandId.startsWith("npm:");
}
