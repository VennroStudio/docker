import { assert, sendJson } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";
import {
  resolveMariaDbInstanceByContainer,
  resolvePostgresInstanceByContainer,
  validateContainerName,
} from "./instances.mjs";
import { mariaDbDatabaseList, mariaDbDumpList, mariadbInstances } from "./mariadb-routes.mjs";
import { postgresDatabaseList, postgresDumpList, postgresInstances } from "./postgres-routes.mjs";
import { parseJsonOutput } from "./validators.mjs";

export { mariadbInstances, postgresInstances };

export async function databases(req, res) {
  const url = new URL(req.url, "http://localhost");
  const engine = url.searchParams.get("engine") || "mariadb";
  const container = url.searchParams.get("container") || "";

  const args = await databaseListArgs({ container, engine });
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
  const args = dumpListArgs(engine);
  sendJson(res, 200, parseJsonOutput(await execMake(args)));
}

async function databaseListArgs({ container, engine }) {
  validateContainerName(container);
  assert(engine === "mariadb" || engine === "postgres", "Unknown database engine");

  if (engine === "mariadb") {
    await resolveMariaDbInstanceByContainer(container);
    return mariaDbDatabaseList({ container })[1];
  }

  await resolvePostgresInstanceByContainer(container);
  return postgresDatabaseList({ container })[1];
}

function dumpListArgs(engine) {
  assert(engine === "mariadb" || engine === "postgres", "Unknown dump engine");
  return (engine === "mariadb" ? mariaDbDumpList() : postgresDumpList())[1];
}
