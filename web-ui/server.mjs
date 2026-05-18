#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.UI_PORT || 8088);
const root = path.resolve("web-ui");
const staticTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const commands = {
  "compose:init": ["make", "init"],
  "compose:up": ["make", "up"],
  "compose:down": ["make", "down"],
  "compose:start": ["make", "start"],
  "compose:stop": ["make", "stop"],
  "logs:nginx": ["make", "logs-nginx"],
  "logs:db": ["make", "logs-db"],
  "logs:pma": ["make", "logs-pma"],
  "minio:up": ["make", "minio-up"],
  "minio:stop": ["make", "minio-stop"],
  "minio:clean": ["make", "minio-clean"],
  "redis:up": ["make", "redis-up"],
  "redis:stop": ["make", "redis-stop"],
  "redis:clean": ["make", "redis-clean"],
  "postgres:up": ["make", "postgres-up"],
  "postgres:stop": ["make", "postgres-stop"],
  "postgres:clean": ["make", "postgres-clean"],
};

createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url.startsWith("/api/stream/")) return await streamRoute(req, res);
    if (req.method === "GET") return await serveStatic(req, res);
    if (req.method === "POST" && req.url === "/api/host/add") return await host(req, res, "add");
    if (req.method === "POST" && req.url === "/api/host/remove") return await host(req, res, "remove");
    if (req.method === "POST" && req.url === "/api/proxy") return await proxy(req, res);
    if (req.method === "POST" && req.url === "/api/run") return await runCommand(req, res);

    sendJson(res, 404, { ok: false, output: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, output: error.message });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Infrastructure UI: http://127.0.0.1:${port}`);
});

async function streamRoute(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (url.pathname === "/api/stream/run") {
    const entry = commands[url.searchParams.get("command")];
    assert(entry, "Unknown command");
    return streamSse(req, res, entry[0], entry.slice(1));
  }

  if (url.pathname === "/api/stream/host") {
    const action = url.searchParams.get("action");
    const domain = url.searchParams.get("domain");
    assert(action === "add" || action === "remove", "Invalid host action");
    validateDomain(domain);
    return streamSse(req, res, "bash", ["./scripts/hosts.sh", action, domain]);
  }

  if (url.pathname === "/api/stream/proxy") {
    const domain = url.searchParams.get("domain");
    const target = url.searchParams.get("target");
    const proxyPort = url.searchParams.get("port");
    const ssl = url.searchParams.get("ssl") === "1";

    validateDomain(domain);
    validateTarget(target);
    validatePort(proxyPort);

    const env = { ...process.env, DOMAIN: domain, TARGET: target, PORT: String(proxyPort) };
    if (ssl) env.SSL = "1";
    else delete env.SSL;

    return streamSse(req, res, "node", [
      "./scripts/npm-proxy.mjs",
      "--domain", domain,
      "--target", target,
      "--port", String(proxyPort),
      "--scheme", "http",
    ], env);
  }

  sendSseError(res, "Not found");
}

async function serveStatic(req, res) {
  const urlPath = req.url === "/" ? "/index.html" : new URL(req.url, "http://localhost").pathname;
  const filePath = path.join(root, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
  const body = await readFile(filePath);

  res.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": staticTypes[path.extname(filePath)] || "application/octet-stream",
  });
  res.end(body);
}

async function host(req, res, action) {
  const { domain } = await body(req);
  validateDomain(domain);
  stream(res, "bash", ["./scripts/hosts.sh", action, domain]);
}

async function proxy(req, res) {
  const { domain, target, port, ssl } = await body(req);
  validateDomain(domain);
  validateTarget(target);
  validatePort(port);

  const env = { ...process.env, DOMAIN: domain, TARGET: target, PORT: String(port) };
  if (ssl) env.SSL = "1";
  else delete env.SSL;

  stream(res, "node", [
    "./scripts/npm-proxy.mjs",
    "--domain", domain,
    "--target", target,
    "--port", String(port),
    "--scheme", "http",
  ], env);
}

async function runCommand(req, res) {
  const { command } = await body(req);
  const entry = commands[command];
  assert(entry, "Unknown command");
  stream(res, entry[0], entry.slice(1));
}

function stream(res, command, args, env = process.env) {
  let child;

  res.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": "text/plain; charset=utf-8",
    "X-Accel-Buffering": "no",
  });

  res.write(`$ ${[command, ...args].join(" ")}\n\n`);

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
    if (!child.killed) child.kill("SIGTERM");
  });
}

function streamSse(req, res, command, args, env = process.env) {
  let child;

  res.writeHead(200, {
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream; charset=utf-8",
    "X-Accel-Buffering": "no",
  });

  sse(res, `$ ${[command, ...args].join(" ")}\n\n`);
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

  req.on("close", () => {
    if (!child.killed) child.kill("SIGTERM");
  });
}

function sse(res, value, event = "message") {
  const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
  res.write(`event: ${event}\n`);
  for (const line of text.split("\n")) res.write(`data: ${line}\n`);
  res.write("\n");
}

function sendSseError(res, message) {
  res.writeHead(404, { "Content-Type": "text/event-stream; charset=utf-8" });
  sse(res, message, "done");
  res.end();
}

async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function validateDomain(value) {
  assert(/^[a-zA-Z0-9.-]+$/.test(value || ""), "Invalid DOMAIN");
}

function validateTarget(value) {
  assert(/^[a-zA-Z0-9._-]+$/.test(value || ""), "Invalid TARGET");
}

function validatePort(value) {
  const portNumber = Number(value);
  assert(Number.isInteger(portNumber) && portNumber > 0 && portNumber <= 65535, "Invalid PORT");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
