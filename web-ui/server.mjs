#!/usr/bin/env node
import { createServer } from "node:http";
import { port } from "./server/config.mjs";
import { getErrorMessage, sendJson } from "./server/http.mjs";
import { host, proxy, runCommand } from "./server/routes/actions.mjs";
import { containers } from "./server/routes/containers.mjs";
import { dumps } from "./server/routes/dumps.mjs";
import { links } from "./server/routes/links.mjs";
import { mariadbInstances } from "./server/routes/mariadb.mjs";
import { meta } from "./server/routes/meta.mjs";
import { postgresInstances } from "./server/routes/postgres.mjs";
import { settings } from "./server/routes/settings.mjs";
import { shellInput, shellStop } from "./server/routes/shell.mjs";
import { status } from "./server/routes/status.mjs";
import { streamRoute } from "./server/routes/stream.mjs";
import { serveStatic } from "./server/static.mjs";

createServer(async (req, res) => {
  try {
    if ((req.method === "GET" || req.method === "POST") && req.url.startsWith("/api/stream/")) {
      return await streamRoute(req, res);
    }
    if (req.method === "GET" && req.url === "/api/status") return await status(req, res);
    if (req.method === "GET" && req.url.startsWith("/api/containers")) return await containers(req, res);
    if (req.method === "GET" && req.url.startsWith("/api/dumps")) return await dumps(req, res);
    if (req.method === "GET" && req.url === "/api/links") return await links(req, res);
    if (req.method === "GET" && req.url === "/api/meta") return await meta(req, res);
    if (req.method === "GET" && req.url === "/api/mariadb/instances") return await mariadbInstances(req, res);
    if (req.method === "GET" && req.url === "/api/postgres/instances") return await postgresInstances(req, res);
    if ((req.method === "GET" || req.method === "PUT") && req.url === "/api/settings") return await settings(req, res);
    if (req.method === "POST" && req.url === "/api/host/add") return await host(req, res, "add");
    if (req.method === "POST" && req.url === "/api/host/remove") return await host(req, res, "remove");
    if (req.method === "POST" && req.url === "/api/proxy") return await proxy(req, res);
    if (req.method === "POST" && req.url === "/api/run") return await runCommand(req, res);
    if (req.method === "POST" && req.url === "/api/stream/shell/input") return await shellInput(req, res);
    if (req.method === "POST" && req.url === "/api/stream/shell/stop") return await shellStop(req, res);
    if (req.url.startsWith("/api/")) return sendJson(res, 404, { ok: false, output: "Not found" });
    if (req.method === "GET" || req.method === "HEAD") return await serveStatic(req, res);

    sendJson(res, 404, { ok: false, output: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, output: getErrorMessage(error) });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`Infrastructure UI: http://127.0.0.1:${port}`);
});
