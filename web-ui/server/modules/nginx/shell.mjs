import { createShellSessionManager } from "../../shell-session.mjs";
import { shellCommand } from "./commands.mjs";

const nginxShell = createShellSessionManager({
  prefix: "nginx",
  resolveCommand: shellCommand,
});

export function streamNginxShell(req, res) {
  return nginxShell.stream(req, res);
}

export const isNginxShellSession = nginxShell.is;
export const stopNginxShell = nginxShell.stop;
export const writeNginxShellInput = nginxShell.write;
