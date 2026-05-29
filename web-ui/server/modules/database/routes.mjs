import { streamSse } from "../../command-runner.mjs";
import { commandMap } from "../../config.mjs";
import { assert, body, sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import {
  isPotentialDatabaseShellContainer,
  resolveMariaDbInstanceByContainer,
  resolvePostgresInstanceByContainer,
  validateContainerName,
} from "./instances.mjs";
import {
  mariaDbDatabaseList,
  mariaDbDumpList,
  mariadbInstances,
  mariaDbStreamPaths,
  mariaDbStreamRoute,
} from "./mariadb-routes.mjs";
import {
  postgresDatabaseList,
  postgresDumpList,
  postgresInstances,
  postgresStreamPaths,
  postgresStreamRoute,
} from "./postgres-routes.mjs";
import { streamDatabaseShell } from "./shell.mjs";
import { parseJsonOutput } from "./validators.mjs";

const databaseCommandPrefixes = ["phpmyadmin:", "pgadmin:", "postgres:"];

export { mariadbInstances, postgresInstances };

export function isDatabaseStreamRoute(req) {
  const url = new URL(req.url, "http://localhost");
  const pathname = url.pathname;

  if (pathname === "/api/stream/run") return isDatabaseCommand(url.searchParams.get("command"));
  if (pathname === "/api/stream/shell") return isPotentialDatabaseShellContainer(url.searchParams.get("container"));
  return mariaDbStreamPaths.has(pathname) || postgresStreamPaths.has(pathname);
}

export async function databaseStreamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");
  const payload = req.method === "POST" ? await body(req) : null;
  const param = (key) => payload?.[key] ?? url.searchParams.get(key);

  if (url.pathname === "/api/stream/run") {
    const commandId = param("command");
    assert(isDatabaseCommand(commandId), "Unknown database command");
    const entry = commandMap[commandId];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1), process.env);
  }

  if (url.pathname === "/api/stream/shell") {
    return await streamDatabaseShell(req, res, param("container"));
  }

  if (mariaDbStreamPaths.has(url.pathname)) {
    return mariaDbStreamRoute(req, res, url.pathname, param);
  }

  if (postgresStreamPaths.has(url.pathname)) {
    return postgresStreamRoute(req, res, url.pathname, param);
  }

  throw new Error("Unknown database stream route");
}

export async function databases(req, res) {
  const url = new URL(req.url, "http://localhost");
  const engine = url.searchParams.get("engine") || "mariadb";
  const container = url.searchParams.get("container") || "";

  const [_command, args] = await databaseListCommand({ container, engine });
  const output = await execMake(args);

  sendJson(res, 200, {
    databases: output
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean),
  });
}

export async function dumps(req, res) {
  const url = new URL(req.url, "http://localhost");
  const engine = url.searchParams.get("engine") || "mariadb";
  const [_command, args] = dumpListCommand(engine);
  sendJson(res, 200, parseJsonOutput(await execMake(args)));
}

async function databaseListCommand({ container, engine }) {
  validateContainerName(container);
  assert(engine === "mariadb" || engine === "postgres", "Unknown database engine");

  if (engine === "mariadb") {
    await resolveMariaDbInstanceByContainer(container);
    return mariaDbDatabaseList({ container });
  }

  await resolvePostgresInstanceByContainer(container);
  return postgresDatabaseList({ container });
}

function dumpListCommand(engine) {
  assert(engine === "mariadb" || engine === "postgres", "Unknown dump engine");
  return engine === "mariadb" ? mariaDbDumpList() : postgresDumpList();
}

function isDatabaseCommand(commandId) {
  return typeof commandId === "string" && databaseCommandPrefixes.some((prefix) => commandId.startsWith(prefix));
}
