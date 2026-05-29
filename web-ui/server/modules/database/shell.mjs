import { createShellSessionManager } from "../../shell-session.mjs";
import { resolveDatabaseShellCommand } from "./instances.mjs";

const databaseShell = createShellSessionManager({
  env: () => ({ ...process.env, COMPOSE_EXEC_FLAGS: "-i", SHELL_FLAGS: "-i" }),
  prefix: "database",
  resolveCommand: resolveDatabaseShellCommand,
});

export function streamDatabaseShell(req, res, container) {
  return databaseShell.stream(req, res, container);
}

export const isDatabaseShellSession = databaseShell.is;
export const stopDatabaseShell = databaseShell.stop;
export const writeDatabaseShellInput = databaseShell.write;
