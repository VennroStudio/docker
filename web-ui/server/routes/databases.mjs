import { execFile } from "node:child_process";
import { projectRoot } from "../config.mjs";
import { assert, sendJson } from "../http.mjs";
import { readMariaDbInstances } from "../mariadb-instances.mjs";
import { readPostgresInstances } from "../postgres-instances.mjs";
import { getRuntimeEnv } from "../settings-store.mjs";

const engineScripts = {
  mariadb: "./scripts/database/mariadb/databases.mjs",
  postgres: "./scripts/database/postgres/databases.mjs",
};

export async function databases(req, res) {
  const url = new URL(req.url, "http://localhost");
  const engine = url.searchParams.get("engine") || "mariadb";
  const container = url.searchParams.get("container") || "";
  const script = engineScripts[engine];

  assert(script, "Unknown database engine");
  validateContainerName(container);

  const target = resolveDatabaseTarget(engine, container);
  const output = await execFileText(
    "node",
    [script, "list", "--container", target.container],
    getRuntimeEnv(target.env),
  );

  sendJson(res, 200, {
    databases: output
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(Boolean),
  });
}

function resolveDatabaseTarget(engine, container) {
  if (engine === "mariadb") {
    const instance = readMariaDbInstances().find((item) => item.container === container);
    assert(instance, "MariaDB container is not configured");
    assert(instance.rootPassword, "MariaDB root password is not configured");
    return {
      container,
      env: {
        MARIADB_CONTAINER: container,
        MARIADB_ROOT_PASSWORD: instance.rootPassword,
      },
    };
  }

  const instance = readPostgresInstances().find((item) => item.container === container);
  assert(instance, "Postgres container is not configured");
  assert(instance.user, "Postgres user is not configured");
  assert(instance.password, "Postgres password is not configured");
  return {
    container,
    env: {
      POSTGRES_CONTAINER: container,
      POSTGRES_PASSWORD: instance.password,
      POSTGRES_USER: instance.user,
    },
  };
}

function validateContainerName(container) {
  assert(/^[A-Za-z0-9_.-]+$/.test(container || ""), "Invalid container name");
}

function execFileText(command, args, env) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { cwd: projectRoot, encoding: "utf8", env }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.trim() || error.message));
        return;
      }

      resolve(stdout);
    });
  });
}
