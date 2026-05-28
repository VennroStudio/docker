import { commandMap } from "../config.mjs";
import { stream } from "../command-runner.mjs";
import { assert, body } from "../http.mjs";
import { getRuntimeEnv } from "../settings-store.mjs";

export async function runCommand(req, res) {
  const { command } = await body(req);
  const entry = commandMap[command];
  assert(entry, "Unknown command");
  stream(res, entry[0], entry.slice(1), getRuntimeEnv());
}
