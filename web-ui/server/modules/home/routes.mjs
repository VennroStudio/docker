import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function homeStatus(_req, res) {
  const [npm, mariadb, postgres, redis, redisinsight, minio, registry, registryUi] = await Promise.all([
    makeJson("npm-status"),
    makeJson("mariadb-status"),
    makeJson("postgres-status"),
    makeJson("redis-status"),
    makeJson("redisinsight-status"),
    makeJson("minio-status"),
    makeJson("registry-status"),
    makeJson("registry-ui-status"),
  ]);

  sendJson(res, 200, {
    services: [
      aggregate("proxy", [npm.value], npm.error),
      aggregate("mariadb", databaseTargets(mariadb.value, postgres.value), firstError(mariadb, postgres)),
      aggregate("redis", [redis.value, redisinsight.value], firstError(redis, redisinsight)),
      aggregate("minio", [minio.value], minio.error),
      aggregate("registry", [registry.value, registryUi.value], firstError(registry, registryUi)),
    ],
  });
}

async function makeJson(command) {
  try {
    return { value: JSON.parse(await execMake([command])) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      value: null,
    };
  }
}

function databaseTargets(mariadb, postgres) {
  const postgresInstances = postgres?.instances || [];

  return [
    mariadb?.phpmyadmin,
    ...(mariadb?.instances || []),
    ...postgresInstances,
    ...(postgresInstances.length > 0 ? [postgres?.pgadmin] : []),
  ];
}

function aggregate(id, targets, error) {
  const items = targets.filter(Boolean);
  const total = items.length;
  const running = items.filter((item) => item.running || item.state === "running").length;
  const existing = items.filter((item) => item.state && item.state !== "missing").length;

  return {
    ...(error ? { error } : {}),
    id,
    running,
    state: serviceState(running, existing, total),
    total,
  };
}

function serviceState(running, existing, total) {
  if (total === 0) return "missing";
  if (running === total) return "running";
  if (running > 0) return "partial";
  if (existing > 0) return "stopped";
  return "missing";
}

function firstError(...results) {
  return results.find((result) => result.error)?.error;
}
