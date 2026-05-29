import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import { mariaDbDatabaseListCommand, mariaDbDumpListCommand } from "./commands.mjs";
import { parseJsonOutput } from "./validators.mjs";

export async function mariadbInstances(_req, res) {
  sendJson(res, 200, parseJsonOutput(await execMake(["mariadb-status"])));
}

export function mariaDbDatabaseList({ container }) {
  return mariaDbDatabaseListCommand({ container });
}

export function mariaDbDumpList() {
  return mariaDbDumpListCommand();
}
