import { streamSse } from "../../command-runner.mjs";
import { commandMap } from "../../config.mjs";
import { assert, sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import { streamMinioShell } from "./shell.mjs";

const minioContainer = "minio-container";

export function isMinioStreamRoute(req) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") return isMinioCommand(url.searchParams.get("command"));
  if (url.pathname === "/api/stream/shell") return url.searchParams.get("container") === minioContainer;
  return false;
}

export async function minioStreamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") {
    const commandId = url.searchParams.get("command");
    assert(isMinioCommand(commandId), "Unknown MinIO command");
    const entry = commandMap[commandId];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1), process.env);
  }

  if (url.pathname === "/api/stream/shell") {
    return streamMinioShell(req, res);
  }

  throw new Error("Unknown MinIO stream route");
}

export async function minioStatus(_req, res) {
  sendJson(res, 200, JSON.parse(await execMake(["minio-status"])));
}

function isMinioCommand(commandId) {
  return typeof commandId === "string" && commandId.startsWith("minio:");
}
