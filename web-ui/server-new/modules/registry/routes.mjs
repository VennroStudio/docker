import { streamSse } from "../../command-runner.mjs";
import { commandMap } from "../../config.mjs";
import { assert, sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import { streamRegistryShell } from "./shell.mjs";

const registryContainers = new Set(["registry-container", "registry-ui-container"]);

export function isRegistryStreamRoute(req) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") return isRegistryCommand(url.searchParams.get("command"));
  if (url.pathname === "/api/stream/shell") return registryContainers.has(url.searchParams.get("container"));
  return false;
}

export async function registryStreamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") {
    const commandId = url.searchParams.get("command");
    assert(isRegistryCommand(commandId), "Unknown Registry command");
    const entry = commandMap[commandId];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1), process.env);
  }

  if (url.pathname === "/api/stream/shell") {
    return streamRegistryShell(req, res, url.searchParams.get("container"));
  }

  throw new Error("Unknown Registry stream route");
}

export async function registryStatus(_req, res) {
  const [registry, registryUi] = await Promise.all([
    execMake(["registry-status"]),
    execMake(["registry-ui-status"]),
  ]);

  sendJson(res, 200, {
    registry: JSON.parse(registry),
    registryUi: JSON.parse(registryUi),
  });
}

function isRegistryCommand(commandId) {
  return typeof commandId === "string" && (commandId.startsWith("registry:") || commandId.startsWith("registry-ui:"));
}
