import { execFile, spawn } from "node:child_process";

export function collect(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stdout = [];
    const stderr = [];

    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({
        code,
        stderr: Buffer.concat(stderr).toString("utf8"),
        stdout: Buffer.concat(stdout).toString("utf8"),
      });
    });
  });
}

export function execFileText(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { encoding: "utf8", env }, (error, stdout, stderr) => {
      if (error) reject(new Error(stderr || stdout || error.message));
      else resolve(stdout);
    });
  });
}

export function runInherit(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit" });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

export function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
}
