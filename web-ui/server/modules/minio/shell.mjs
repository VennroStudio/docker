import { createShellSessionManager } from "../../shell-session.mjs";

const minioShell = createShellSessionManager({
  env: () => ({ ...process.env, COMPOSE_EXEC_FLAGS: "-i" }),
  prefix: "minio",
  resolveCommand: () => ["make", ["minio-shell"]],
});

export function streamMinioShell(req, res) {
  return minioShell.stream(req, res);
}

export const isMinioShellSession = minioShell.is;
export const stopMinioShell = minioShell.stop;
export const writeMinioShellInput = minioShell.write;
