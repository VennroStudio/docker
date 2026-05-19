import { commandMap } from "../config.mjs";
import { sendSseError, streamSse } from "../command-runner.mjs";
import { assert, validateDomain, validatePort, validateTarget } from "../http.mjs";
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

  sendSseError(res, "Not found");
}
