import { streamSse } from "../../command-runner.mjs";
import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import {
  postgresDatabaseCommand,
  postgresDatabaseListCommand,
  postgresDumpListCommand,
  postgresExportCommand,
  postgresImportCommand,
  postgresInstanceActionCommand,
  postgresInstanceCreateCommand,
} from "./commands.mjs";
import {
  parseJsonOutput,
  validateInstanceAction,
  validatePostgresCreateForm,
  validatePostgresDatabaseForm,
  validatePostgresDumpForm,
  validatePostgresInstanceName,
} from "./validators.mjs";

export const postgresStreamPaths = new Set([
  "/api/stream/postgres-database",
  "/api/stream/postgres-export",
  "/api/stream/postgres-import",
  "/api/stream/postgres-instance",
  "/api/stream/postgres-instance-add",
]);

export async function postgresStreamRoute(req, res, pathname, param) {
  if (pathname === "/api/stream/postgres-instance-add") {
    const [command, args] = postgresInstanceCreateCommand(validatePostgresCreateForm(param));
    return streamSse(req, res, command, args, process.env);
  }

  if (pathname === "/api/stream/postgres-instance") {
    const name = param("name");
    const action = param("action");
    validateInstanceAction(action);
    validatePostgresInstanceName(name);
    const [command, args] = postgresInstanceActionCommand(name, action);
    return streamSse(req, res, command, args, process.env);
  }

  if (pathname === "/api/stream/postgres-import" || pathname === "/api/stream/postgres-export") {
    const form = await validatePostgresDumpForm(param);
    const [command, args] = pathname.endsWith("import") ? postgresImportCommand(form) : postgresExportCommand(form);
    return streamSse(req, res, command, args, process.env);
  }

  if (pathname === "/api/stream/postgres-database") {
    const form = await validatePostgresDatabaseForm(param);
    const [command, args] = postgresDatabaseCommand(form);
    return streamSse(req, res, command, args, process.env);
  }

  throw new Error("Unknown Postgres stream route");
}

export async function postgresInstances(_req, res) {
  sendJson(res, 200, parseJsonOutput(await execMake(["postgres-status"])));
}

export function postgresDatabaseList({ container }) {
  return postgresDatabaseListCommand({ container });
}

export function postgresDumpList() {
  return postgresDumpListCommand();
}
