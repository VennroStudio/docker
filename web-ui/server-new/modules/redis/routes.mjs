import { streamSse } from "../../command-runner.mjs";
import { commandMap } from "../../config.mjs";
import { assert, sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import { streamRedisShell } from "./shell.mjs";

const redisContainers = new Set(["redis-container", "redisinsight-container"]);

export function isRedisStreamRoute(req) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") return isRedisCommand(url.searchParams.get("command"));
  if (url.pathname === "/api/stream/shell") return redisContainers.has(url.searchParams.get("container"));
  return false;
}

export async function redisStreamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") {
    const commandId = url.searchParams.get("command");
    assert(isRedisCommand(commandId), "Unknown Redis command");
    const entry = commandMap[commandId];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1), process.env);
  }

  if (url.pathname === "/api/stream/shell") {
    return streamRedisShell(req, res, url.searchParams.get("container"));
  }

  throw new Error("Unknown Redis stream route");
}

export async function redisStatus(_req, res) {
  const [redis, redisinsight] = await Promise.all([
    execMake(["redis-status"]),
    execMake(["redisinsight-status"]),
  ]);

  sendJson(res, 200, {
    redis: JSON.parse(redis),
    redisinsight: JSON.parse(redisinsight),
  });
}

function isRedisCommand(commandId) {
  return typeof commandId === "string" && (commandId.startsWith("redis:") || commandId.startsWith("redisinsight:"));
}
