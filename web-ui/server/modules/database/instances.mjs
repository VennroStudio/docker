import { assert } from "../../http.mjs";
import { execMake } from "../../make-runner.mjs";

export async function resolveMariaDbInstanceByContainer(container) {
  validateContainerName(container, "MariaDB");
  return parseJsonOutput(await execMake(["mariadb-instance-resolve", `CONTAINER=${container}`]));
}

export async function resolvePostgresInstanceByContainer(container) {
  validateContainerName(container, "Postgres");
  return parseJsonOutput(await execMake(["postgres-instance-resolve", `CONTAINER=${container}`]));
}

export function isPotentialDatabaseShellContainer(container) {
  return (
    container === "phpmyadmin-container" ||
    container === "pgadmin-container" ||
    /^mariadb-[A-Za-z0-9_.-]+-container$/.test(container || "") ||
    /^postgres-[A-Za-z0-9_.-]+-container$/.test(container || "")
  );
}

export async function resolveDatabaseShellCommand(container) {
  validateContainerName(container, "Database");

  if (container === "phpmyadmin-container") return ["make", ["phpmyadmin-shell"]];
  if (container === "pgadmin-container") return ["make", ["pgadmin-shell"]];

  if (container.startsWith("mariadb-")) {
    await resolveMariaDbInstanceByContainer(container);
    return ["make", ["mariadb-instance-shell", `CONTAINER=${container}`]];
  }

  if (container.startsWith("postgres-")) {
    await resolvePostgresInstanceByContainer(container);
    return ["make", ["postgres-instance-shell", `CONTAINER=${container}`]];
  }

  throw new Error("Unknown database shell container");
}

export function validateContainerName(container, label = "Database") {
  assert(/^[A-Za-z0-9_.-]+$/.test(container || ""), `Invalid ${label} container name`);
}

export function validateInstanceName(name, label = "Database") {
  assert(/^[a-z0-9][a-z0-9-]*$/.test(name || ""), `Invalid ${label} instance name`);
}

function parseJsonOutput(output) {
  try {
    return JSON.parse(output);
  } catch {
    throw new Error(`Command returned invalid JSON: ${output}`);
  }
}
