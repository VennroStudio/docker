import { streamSse } from "../../command-runner.mjs";
import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import {
  mariaDbDatabaseCommand,
  mariaDbDatabaseListCommand,
  mariaDbDumpListCommand,
  mariaDbExportCommand,
  mariaDbImportCommand,
  mariaDbInstanceActionCommand,
  mariaDbInstanceCreateCommand,
} from "./commands.mjs";
import {
  parseJsonOutput,
  validateInstanceAction,
  validateMariaDbCreateForm,
  validateMariaDbDatabaseForm,
  validateMariaDbDumpForm,
  validateMariaDbInstanceName,
} from "./validators.mjs";

export const mariaDbStreamPaths = new Set([
  "/api/stream/mariadb-database",
  "/api/stream/mariadb-export",
  "/api/stream/mariadb-import",
  "/api/stream/mariadb-instance",
  "/api/stream/mariadb-instance-add",
]);

export async function mariaDbStreamRoute(req, res, pathname, param) {
  if (pathname === "/api/stream/mariadb-instance-add") {
    const [command, args] = mariaDbInstanceCreateCommand(validateMariaDbCreateForm(param));
    return streamSse(req, res, command, args, process.env);
  }

  if (pathname === "/api/stream/mariadb-instance") {
    const name = param("name");
    const action = param("action");
    validateInstanceAction(action);
    validateMariaDbInstanceName(name);
    const [command, args] = mariaDbInstanceActionCommand(name, action);
    return streamSse(req, res, command, args, process.env);
  }

  if (pathname === "/api/stream/mariadb-import" || pathname === "/api/stream/mariadb-export") {
    const form = await validateMariaDbDumpForm(param);
    const [command, args] = pathname.endsWith("import") ? mariaDbImportCommand(form) : mariaDbExportCommand(form);
    return streamSse(req, res, command, args, process.env);
  }

  if (pathname === "/api/stream/mariadb-database") {
    const form = await validateMariaDbDatabaseForm(param);
    const [command, args] = mariaDbDatabaseCommand(form);
    return streamSse(req, res, command, args, process.env);
  }

  throw new Error("Unknown MariaDB stream route");
}

export async function mariadbInstances(_req, res) {
  sendJson(res, 200, parseJsonOutput(await execMake(["mariadb-status"])));
}

export function mariaDbDatabaseList({ container }) {
  return mariaDbDatabaseListCommand({ container });
}

export function mariaDbDumpList() {
  return mariaDbDumpListCommand();
}
