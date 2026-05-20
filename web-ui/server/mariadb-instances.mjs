import { readFileSync } from "node:fs";
import path from "node:path";
import { projectRoot } from "./config.mjs";
import { assert } from "./http.mjs";

const instancesPath = path.join(projectRoot, "docker/mariadb/instances.json");
const instanceActions = new Set(["clean", "down", "logs", "start", "stop", "up"]);

export function readMariaDbInstances() {
  return JSON.parse(readFileSync(instancesPath, "utf8"));
}

export function findMariaDbInstance(name) {
  assert(/^[a-z0-9][a-z0-9-]*$/.test(name || ""), "Invalid MariaDB instance name");
  const instance = readMariaDbInstances().find((item) => item.name === name);
  assert(instance, "MariaDB instance not found");
  return instance;
}

export function mariaDbInstanceCommand(name, action) {
  assert(instanceActions.has(action), "Invalid MariaDB instance action");
  const instance = findMariaDbInstance(name);

  if (action === "clean") {
    return [
      "sh",
      [
        "-lc",
        `docker compose -f ${shellQuote(instance.composeFile)} down && docker rmi mariadb:${shellQuote(instance.version)} 2>/dev/null || true`,
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
