import { sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import { postgresDatabaseListCommand, postgresDumpListCommand } from "./commands.mjs";
import { parseJsonOutput } from "./validators.mjs";

export async function postgresInstances(_req, res) {
  sendJson(res, 200, parseJsonOutput(await execMake(["postgres-status"])));
}

export function postgresDatabaseList({ container }) {
  return postgresDatabaseListCommand({ container });
}

export function postgresDumpList() {
  return postgresDumpListCommand();
}
