import { commandMap } from "../config.mjs";
import { stream } from "../command-runner.mjs";
import { assert, body, validateDomain, validatePort, validateTarget } from "../http.mjs";
import { getRuntimeEnv } from "../settings-store.mjs";

export async function host(req, res, action) {
  const { domain } = await body(req);
  validateDomain(domain);
  stream(res, "bash", ["./scripts/hosts.sh", action, domain]);
}

export async function proxy(req, res) {
  const { domain, target, port, ssl } = await body(req);
  validateDomain(domain);
  validateTarget(target);
  validatePort(port);

  const env = getRuntimeEnv({ DOMAIN: domain, TARGET: target, PORT: String(port) });
  if (ssl) env.SSL = "1";
  else delete env.SSL;

  stream(
    res,
    "node",
    ["./scripts/npm-proxy.mjs", "--domain", domain, "--target", target, "--port", String(port), "--scheme", "http"],
    env,
  );
}

export async function runCommand(req, res) {
  const { command } = await body(req);
  const entry = commandMap[command];
  assert(entry, "Unknown command");
  stream(res, entry[0], entry.slice(1), getRuntimeEnv());
}
