import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { projectRoot } from "./config.mjs";
import { assert } from "./http.mjs";

const instancesPath = path.join(projectRoot, "docker/postgres/instances.json");
const instanceActions = new Set(["clean", "down", "logs", "start", "stop", "up"]);

export function readPostgresInstances() {
  if (!existsSync(instancesPath)) return [];
  return JSON.parse(readFileSync(instancesPath, "utf8")).map((instance) => ({
    ...instance,
    composeFile: composeFileFor(instance.name),
  }));
}

export function findPostgresInstance(name) {
  assert(/^[a-z0-9][a-z0-9-]*$/.test(name || ""), "Invalid Postgres instance name");
  const instance = readPostgresInstances().find((item) => item.name === name);
  assert(instance, "Postgres instance not found");
  return instance;
}

export function postgresInstanceCommand(name, action) {
  assert(instanceActions.has(action), "Invalid Postgres instance action");
  const instance = findPostgresInstance(name);

  if (action === "clean") {
    return [
      "sh",
      [
        "-lc",
        `docker compose -f ${shellQuote(instance.composeFile)} down && docker rmi postgres:${shellQuote(instance.version)}-alpine 2>/dev/null || true`,
      ],
    ];
  }

  const args = ["compose", "-f", instance.composeFile];
  if (action === "up") args.push("up", "-d");
  else if (action === "logs") args.push("logs", "-f");
  else args.push(action);

  return ["docker", args];
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function composeFileFor(name) {
  return `docker/compose/docker-compose-postgres-${name}.yml`;
}
