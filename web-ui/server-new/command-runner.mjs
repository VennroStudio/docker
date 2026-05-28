import { spawn } from "node:child_process";

const sensitiveFlags = new Set(["--password", "--root-password", "--secret", "--token", "--npm-password", "--api-key"]);

export function stream(res, command, args, env = process.env) {
  let child;

  res.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": "text/plain; charset=utf-8",
    "X-Accel-Buffering": "no",
  });

  res.write(`$ ${formatCommandForDisplay(command, args)}\n\n`);
  child = spawn(command, args, { env });

  child.stdout.on("data", (data) => res.write(data));
  child.stderr.on("data", (data) => res.write(data));

  child.on("error", (error) => {
    res.write(`${error.message}\n`);
    res.end("\n[exit 1]\n");
  });

  child.on("close", (code) => {
    if (!res.writableEnded) res.end(`\n[exit ${code}]\n`);
  });

  res.on("close", () => {
    if (child && !child.killed) child.kill("SIGTERM");
  });
}

export function streamSse(req, res, command, args, env = process.env) {
  let child;

  res.writeHead(200, {
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream; charset=utf-8",
    "X-Accel-Buffering": "no",
  });

  sse(res, `$ ${formatCommandForDisplay(command, args)}\n\n`);
  child = spawn(command, args, { env });

  child.stdout.on("data", (data) => sse(res, data));
  child.stderr.on("data", (data) => sse(res, data));

  child.on("error", (error) => {
    sse(res, `${error.message}\n`);
    sse(res, "\n[exit 1]\n", "done");
    res.end();
  });

  child.on("close", (code) => {
    if (!res.writableEnded) {
      sse(res, `\n[exit ${code}]\n`, "done");
      res.end();
    }
  });

  res.on("close", () => {
    if (child && !child.killed) child.kill("SIGTERM");
  });
}

export function formatCommandForDisplay(command, args) {
  return [command, ...redactArgs(args)].join(" ");
}

function redactArgs(args) {
  let redactNext = false;

  return args.map((arg) => {
    if (redactNext) {
      redactNext = false;
      return "********";
    }

    const [flag] = String(arg).split("=", 1);
    if (!sensitiveFlags.has(flag)) return arg;

    if (String(arg).includes("=")) return `${flag}=********`;
    redactNext = true;
    return arg;
  });
}

export function sse(res, value, event = "message") {
  const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
  res.write(`event: ${event}\n`);
  for (const line of text.split("\n")) res.write(`data: ${line}\n`);
  res.write("\n");
}

export function sendSseError(res, message) {
  res.writeHead(404, { "Content-Type": "text/event-stream; charset=utf-8" });
  sse(res, message, "done");
  res.end();
}
