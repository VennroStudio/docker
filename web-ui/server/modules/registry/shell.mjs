import { createShellSessionManager } from "../../shell-session.mjs";

const registryShell = createShellSessionManager({
  env: () => ({ ...process.env, COMPOSE_EXEC_FLAGS: "-i" }),
  prefix: "registry",
  resolveCommand: registryShellCommand,
});

export function streamRegistryShell(req, res, container) {
  return registryShell.stream(req, res, container);
}

export const isRegistryShellSession = registryShell.is;
export const stopRegistryShell = registryShell.stop;
export const writeRegistryShellInput = registryShell.write;

function registryShellCommand(container) {
  if (container === "registry-container") return ["make", ["registry-shell"]];
  if (container === "registry-ui-container") return ["make", ["registry-ui-shell"]];
  throw new Error("Unknown Registry shell container");
}
