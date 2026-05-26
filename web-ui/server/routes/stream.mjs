import { commandMap } from "../config.mjs";
import { sendSseError, streamSse } from "../command-runner.mjs";
import { getContainerStates } from "../docker-status.mjs";
import { assert, body, validateDomain, validatePort, validateTarget } from "../http.mjs";
import { mariaDbInstanceCommand, readMariaDbInstances } from "../mariadb-instances.mjs";
import { postgresInstanceCommand } from "../postgres-instances.mjs";
import { getRuntimeEnv } from "../settings-store.mjs";
import { streamShell } from "../shell-sessions.mjs";

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

  if (url.pathname === "/api/stream/host") {
    const action = param("action");
    const domain = param("domain");
    assert(action === "add" || action === "remove", "Invalid host action");
    validateDomain(domain);
    return streamSse(req, res, "bash", ["./scripts/hosts.sh", action, domain]);
  }

  if (url.pathname === "/api/stream/proxy") {
    const domain = param("domain");
    const target = param("target");
    const proxyPort = param("port");
    const ssl = isTruthy(param("ssl"));

    validateDomain(domain);
    validateTarget(target);
    validatePort(proxyPort);

    const env = { ...runtimeEnv, DOMAIN: domain, TARGET: target, PORT: String(proxyPort) };
    if (ssl) env.SSL = "1";
    else delete env.SSL;

    return streamSse(
      req,
      res,
      "node",
      [
        "./scripts/npm-proxy.mjs",
        "--domain",
        domain,
        "--target",
        target,
        "--port",
        String(proxyPort),
        "--scheme",
        "http",
      ],
      env,
    );
  }

  if (url.pathname === "/api/stream/proxy-delete") {
    const domain = param("domain");
    validateDomain(domain);
    return streamSse(req, res, "node", ["./scripts/npm-proxy.mjs", "--delete", "--domain", domain], runtimeEnv);
  }

  if (url.pathname === "/api/stream/shell") {
    const container = param("container");
    assert(container, "Container is required");
    return streamShell(req, res, container);
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
      "./scripts/mariadb-instances.mjs",
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
    const container = param("container") || "mariadb-container";
    const filePath = param("filePath");
    const database = param("database");

    validateContainerName(container);
    const instance = findMariaDbInstanceByContainer(container);
    await validateRunningMariaDbContainer(container);
    validateDumpFilePath(filePath);
    validateDatabaseName(database);

    return streamSse(
      req,
      res,
      "node",
      [
        "./scripts/mariadb-import.mjs",
        "--container",
        container,
        "--root-password",
        instance.rootPassword,
        "--file",
        filePath,
        "--database",
        database,
      ],
      runtimeEnv,
    );
  }

  if (url.pathname === "/api/stream/mariadb-export") {
    const container = param("container") || "mariadb-container";
    const filePath = param("filePath");
    const database = param("database");

    validateContainerName(container);
    const instance = findMariaDbInstanceByContainer(container);
    await validateRunningMariaDbContainer(container);
    validateDumpFilePath(filePath);
    validateDatabaseName(database);

    return streamSse(
      req,
      res,
      "node",
      [
        "./scripts/mariadb-export.mjs",
        "--container",
        container,
        "--root-password",
        instance.rootPassword,
        "--file",
        filePath,
        "--database",
        database,
      ],
      runtimeEnv,
    );
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
        "./scripts/postgres-instances.mjs",
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

  sendSseError(res, "Not found");
}

function isTruthy(value) {
  return value === true || ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
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

async function validateRunningMariaDbContainer(container) {
  const state = (await getContainerStates([container])).get(container);
  assert(state?.state === "running", "MariaDB container must be running");
}

function validateDumpFilePath(filePath) {
  assert(filePath, "Dump file path is required");
  assert(!/[\0\r\n]/.test(filePath), "Invalid dump file path");
  assert(String(filePath).endsWith(".sql") || String(filePath).endsWith(".sql.gz"), "Invalid dump file extension");
}
