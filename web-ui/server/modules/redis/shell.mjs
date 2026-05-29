import { createShellSessionManager } from "../../shell-session.mjs";

const redisShell = createShellSessionManager({
  env: () => ({ ...process.env, COMPOSE_EXEC_FLAGS: "-i" }),
  prefix: "redis",
  resolveCommand: redisShellCommand,
});

export function streamRedisShell(req, res, container) {
  return redisShell.stream(req, res, container);
}

export const isRedisShellSession = redisShell.is;
export const stopRedisShell = redisShell.stop;
export const writeRedisShellInput = redisShell.write;

function redisShellCommand(container) {
  if (container === "redis-container") return ["make", ["redis-shell"]];
  if (container === "redisinsight-container") return ["make", ["redisinsight-shell"]];
  throw new Error("Unknown Redis shell container");
}
