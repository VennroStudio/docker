import { commandMap } from "../config.mjs";
import { sendSseError, streamSse } from "../command-runner.mjs";
import { getContainerStates } from "../docker-status.mjs";
import { assert, body, validatePort } from "../http.mjs";
import { mariaDbInstanceCommand, readMariaDbInstances } from "../mariadb-instances.mjs";
import { postgresInstanceCommand, readPostgresInstances } from "../postgres-instances.mjs";
import { getRuntimeEnv } from "../settings-store.mjs";

export async function streamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");
  const payload = req.method === "POST" ? await body(req) : null;
  const param = (key) => payload?.[key] ?? url.searchParams.get(key);
  const runtimeEnv = getRuntimeEnv();

  if (url.pathname === "/api/stream/run") {
    const entry = commandMap[param("command")];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1), runtimeEnv);
  }

  if (url.pathname === "/api/stream/mariadb-instance-add") {
    const version = param("version");
    const user = param("user");
    const password = param("password");
    const rootPassword = param("rootPassword");
    const authMode = param("authMode") || "config";
    const port = param("port");

    assert(/^\d+(\.\d+){1,2}$/.test(version || ""), "Invalid MariaDB version");
    assert(user, "MariaDB user is required");
    assert(password, "MariaDB password is required");
    assert(rootPassword, "MariaDB root password is required");
    assert(authMode === "config" || authMode === "cookie", "Invalid phpMyAdmin auth mode");
    if (port) validatePort(port);

    const args = [
      "./scripts/database/mariadb/instances.mjs",
      "add",
      "--version",
      version,
      "--user",
      user,
      "--password",
      password,
      "--root-password",
      rootPassword,
      "--auth-mode",
      authMode,
    ];
    if (port) args.push("--port", String(port));
    return streamSse(req, res, "node", args, runtimeEnv);
  }

  if (url.pathname === "/api/stream/mariadb-instance") {
    const [command, args] = mariaDbInstanceCommand(param("name"), param("action"));
    return streamSse(req, res, command, args, runtimeEnv);
  }

  if (url.pathname === "/api/stream/mariadb-import") {
    const container = param("container");
    const filePath = param("filePath");
    const database = param("database");

    validateContainerName(container);
    const instance = findMariaDbInstanceByContainer(container);
    await validateRunningMariaDbContainer(container);
    validateDumpFilePath(filePath);
    validateDatabaseName(database);

    return streamSse(req, res, "make", ["-e", "mariadb-import"], {
      ...runtimeEnv,
      DATABASE: database,
      DUMP_FILE: filePath,
      MARIADB_CONTAINER: container,
      MARIADB_ROOT_PASSWORD: instance.rootPassword,
    });
  }

  if (url.pathname === "/api/stream/mariadb-export") {
    const container = param("container");
    const filePath = param("filePath");
    const database = param("database");

    validateContainerName(container);
    const instance = findMariaDbInstanceByContainer(container);
    await validateRunningMariaDbContainer(container);
    validateDumpFilePath(filePath);
    validateDatabaseName(database);

    return streamSse(req, res, "make", ["-e", "mariadb-export"], {
      ...runtimeEnv,
      DATABASE: database,
      DUMP_FILE: filePath,
      MARIADB_CONTAINER: container,
      MARIADB_ROOT_PASSWORD: instance.rootPassword,
    });
  }

  if (url.pathname === "/api/stream/mariadb-database") {
    const action = param("action");
    const container = param("container");
    const database = param("database");

    assert(action === "create" || action === "drop", "Invalid MariaDB database action");
    validateContainerName(container);
    const instance = findMariaDbInstanceByContainer(container);
    await validateRunningMariaDbContainer(container);
    validateDatabaseName(database);

    return streamSse(req, res, "make", ["-e", `mariadb-db-${action === "create" ? "create" : "drop"}`], {
      ...runtimeEnv,
      DATABASE: database,
      MARIADB_CONTAINER: container,
      MARIADB_ROOT_PASSWORD: instance.rootPassword,
    });
  }

  if (url.pathname === "/api/stream/postgres-instance-add") {
    const version = param("version");
    const user = param("user");
    const password = param("password");
    const database = param("database");

    assert(/^\d+(\.\d+)?$/.test(version || ""), "Invalid Postgres version");
    assert(user, "Postgres user is required");
    assert(password, "Postgres password is required");
    assert(database, "Postgres database is required");

    return streamSse(
      req,
      res,
      "node",
      [
        "./scripts/database/postgres/instances.mjs",
        "add",
        "--version",
        version,
        "--user",
        user,
        "--password",
        password,
        "--database",
        database,
      ],
      runtimeEnv,
    );
  }

  if (url.pathname === "/api/stream/postgres-instance") {
    const [command, args] = postgresInstanceCommand(param("name"), param("action"));
    return streamSse(req, res, command, args, runtimeEnv);
  }

  if (url.pathname === "/api/stream/postgres-import") {
    const container = param("container");
    const filePath = param("filePath");
    const database = param("database");

    validateContainerName(container);
    const instance = findPostgresInstanceByContainer(container);
    await validateRunningPostgresContainer(container);
    validatePostgresDumpFilePath(filePath);
    validatePostgresDatabaseName(database);

    return streamSse(req, res, "make", ["-e", "postgres-import"], {
      ...runtimeEnv,
      DUMP_FILE: filePath,
      POSTGRES_CONTAINER: container,
      POSTGRES_DB: database,
      POSTGRES_PASSWORD: instance.password,
      POSTGRES_USER: instance.user,
    });
  }

  if (url.pathname === "/api/stream/postgres-export") {
    const container = param("container");
    const filePath = param("filePath");
    const database = param("database");

    validateContainerName(container);
    const instance = findPostgresInstanceByContainer(container);
    await validateRunningPostgresContainer(container);
    validatePostgresDumpFilePath(filePath);
    validatePostgresDatabaseName(database);

    return streamSse(req, res, "make", ["-e", "postgres-export"], {
      ...runtimeEnv,
      DUMP_FILE: filePath,
      POSTGRES_CONTAINER: container,
      POSTGRES_DB: database,
      POSTGRES_PASSWORD: instance.password,
      POSTGRES_USER: instance.user,
    });
  }

  if (url.pathname === "/api/stream/postgres-database") {
    const action = param("action");
    const container = param("container");
    const database = param("database");

    assert(action === "create" || action === "drop", "Invalid Postgres database action");
    validateContainerName(container);
    const instance = findPostgresInstanceByContainer(container);
    await validateRunningPostgresContainer(container);
    validatePostgresDatabaseName(database);

    return streamSse(req, res, "make", ["-e", `postgres-db-${action === "create" ? "create" : "drop"}`], {
      ...runtimeEnv,
      DATABASE: database,
      POSTGRES_CONTAINER: container,
      POSTGRES_PASSWORD: instance.password,
      POSTGRES_USER: instance.user,
    });
  }

  sendSseError(res, "Not found");
}

function validateDatabaseName(database) {
  assert(/^[A-Za-z0-9_$.-]+$/.test(database || ""), "Invalid database name");
}

function validateContainerName(container) {
  assert(/^[A-Za-z0-9_.-]+$/.test(container || ""), "Invalid MariaDB container name");
}

function findMariaDbInstanceByContainer(container) {
  const instance = readMariaDbInstances().find((item) => item.container === container);
  assert(instance, "MariaDB container is not configured");
  assert(instance.rootPassword, "MariaDB root password is not configured");
  return instance;
}

function findPostgresInstanceByContainer(container) {
  const instance = readPostgresInstances().find((item) => item.container === container);
  assert(instance, "Postgres container is not configured");
  assert(instance.user, "Postgres user is not configured");
  assert(instance.password, "Postgres password is not configured");
  return instance;
}

async function validateRunningMariaDbContainer(container) {
  const state = (await getContainerStates([container])).get(container);
  assert(state?.state === "running", "MariaDB container must be running");
}

async function validateRunningPostgresContainer(container) {
  const state = (await getContainerStates([container])).get(container);
  assert(state?.state === "running", "Postgres container must be running");
}

function validateDumpFilePath(filePath) {
  assert(filePath, "Dump file path is required");
  assert(!/[\0\r\n]/.test(filePath), "Invalid dump file path");
  assert(String(filePath).endsWith(".sql") || String(filePath).endsWith(".sql.gz"), "Invalid dump file extension");
}

function validatePostgresDatabaseName(database) {
  assert(/^[A-Za-z0-9_]+$/.test(database || ""), "Invalid Postgres database name");
}

function validatePostgresDumpFilePath(filePath) {
  assert(filePath, "Dump file path is required");
  assert(!/[\0\r\n]/.test(filePath), "Invalid dump file path");
  assert(
    String(filePath).endsWith(".sql") || String(filePath).endsWith(".sql.gz") || String(filePath).endsWith(".dump"),
    "Invalid dump file extension",
  );
}
