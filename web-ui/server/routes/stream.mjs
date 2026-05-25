import { commandMap } from "../config.mjs";
import { sendSseError, streamSse } from "../command-runner.mjs";
import { assert, validateDomain, validatePort, validateTarget } from "../http.mjs";
import { mariaDbInstanceCommand } from "../mariadb-instances.mjs";
import { postgresInstanceCommand } from "../postgres-instances.mjs";
import { streamShell } from "../shell-sessions.mjs";

export async function streamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") {
    const entry = commandMap[url.searchParams.get("command")];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1));
  }

  if (url.pathname === "/api/stream/host") {
    const action = url.searchParams.get("action");
    const domain = url.searchParams.get("domain");
    assert(action === "add" || action === "remove", "Invalid host action");
    validateDomain(domain);
    return streamSse(req, res, "bash", ["./scripts/hosts.sh", action, domain]);
  }

  if (url.pathname === "/api/stream/proxy") {
    const domain = url.searchParams.get("domain");
    const target = url.searchParams.get("target");
    const proxyPort = url.searchParams.get("port");
    const ssl = url.searchParams.get("ssl") === "1";

    validateDomain(domain);
    validateTarget(target);
    validatePort(proxyPort);

    const env = { ...process.env, DOMAIN: domain, TARGET: target, PORT: String(proxyPort) };
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
    const domain = url.searchParams.get("domain");
    validateDomain(domain);
    return streamSse(req, res, "node", ["./scripts/npm-proxy.mjs", "--delete", "--domain", domain]);
  }

  if (url.pathname === "/api/stream/shell") {
    const container = url.searchParams.get("container");
    assert(container, "Container is required");
    return streamShell(req, res, container);
  }

  if (url.pathname === "/api/stream/mariadb-instance-add") {
    const version = url.searchParams.get("version");
    const user = url.searchParams.get("user");
    const password = url.searchParams.get("password");
    const rootPassword = url.searchParams.get("rootPassword");
    const authMode = url.searchParams.get("authMode") || "config";
    const port = url.searchParams.get("port");

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
    if (port) args.push("--port", port);
    return streamSse(req, res, "node", args);
  }

  if (url.pathname === "/api/stream/mariadb-instance") {
    const [command, args] = mariaDbInstanceCommand(url.searchParams.get("name"), url.searchParams.get("action"));
    return streamSse(req, res, command, args);
  }

  if (url.pathname === "/api/stream/postgres-instance-add") {
    const version = url.searchParams.get("version");
    const user = url.searchParams.get("user");
    const password = url.searchParams.get("password");
    const database = url.searchParams.get("database");

    assert(/^\d+(\.\d+)?$/.test(version || ""), "Invalid Postgres version");
    assert(user, "Postgres user is required");
    assert(password, "Postgres password is required");
    assert(database, "Postgres database is required");

    return streamSse(req, res, "node", [
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
    ]);
  }

  if (url.pathname === "/api/stream/postgres-instance") {
    const [command, args] = postgresInstanceCommand(url.searchParams.get("name"), url.searchParams.get("action"));
    return streamSse(req, res, command, args);
  }

  sendSseError(res, "Not found");
}
