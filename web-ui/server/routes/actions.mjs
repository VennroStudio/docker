import { commandMap } from "../config.mjs";
import { stream } from "../command-runner.mjs";
import { assert, body, validateDomain, validatePort, validateTarget } from "../http.mjs";
import { getRuntimeEnv } from "../settings-store.mjs";

export async function host(req, res, action) {
  const { domain } = await body(req);
  validateDomain(domain);
  stream(res, "make", [action === "add" ? "host-add" : "host-remove", `DOMAIN=${domain}`], getRuntimeEnv());
}

export async function proxy(req, res) {
  const { domain, target, port, ssl } = await body(req);
  validateDomain(domain);
  validateTarget(target);
  validatePort(port);

  const args = ["app-proxy", `DOMAIN=${domain}`, `TARGET=${target}`, `PORT=${String(port)}`];
  if (ssl) args.push("SSL=1");
  stream(res, "make", args, getRuntimeEnv());
}

export async function runCommand(req, res) {
  const { command } = await body(req);
  const entry = commandMap[command];
  assert(entry, "Unknown command");
  stream(res, entry[0], entry.slice(1), getRuntimeEnv());
}
