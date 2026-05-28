import { execFile } from "node:child_process";

export function execMake(args, env = process.env) {
  return execFileText("make", args, env);
}

function execFileText(command, args, env) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { encoding: "utf8", env }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || stdout || error.message));
      else resolve(stdout);
    });
  });
}
