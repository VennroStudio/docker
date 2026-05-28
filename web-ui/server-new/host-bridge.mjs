#!/usr/bin/env node
import { createServer } from "node:http";
import { getErrorMessage, sendJson } from "./http.mjs";
import { meta } from "./meta-route.mjs";
import { host, isNginxStreamRoute, nginxStatus, nginxStreamRoute, proxy } from "./modules/nginx/routes.mjs";
import { runCommand } from "./run-route.mjs";
import { generateEnv, settings } from "./settings-route.mjs";
import { shellInput, shellStop } from "./shell-router.mjs";

const port = Number(process.env.HOST_BRIDGE_PORT || 8099);
const hostName = process.env.HOST_BRIDGE_HOST || "0.0.0.0";

createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/stream/shell/input") return await shellInput(req, res);
    if (req.method === "POST" && req.url === "/api/stream/shell/stop") return await shellStop(req, res);
    if ((req.method === "GET" || req.method === "POST") && req.url.startsWith("/api/stream/")) {
      if (isNginxStreamRoute(req)) return await nginxStreamRoute(req, res);
      return sendJson(res, 404, { ok: false, output: "Unknown host bridge stream route" });
    }

    if (req.method === "GET" && req.url === "/api/meta") return await meta(req, res);
    if (req.method === "GET" && req.url === "/api/nginx/status") return await nginxStatus(req, res);
    if ((req.method === "GET" || req.method === "PUT") && req.url === "/api/settings") return await settings(req, res);
    if (req.method === "POST" && req.url === "/api/settings/env") return await generateEnv(req, res);
    if (req.method === "POST" && req.url === "/api/host/add") return await host(req, res, "add");
    if (req.method === "POST" && req.url === "/api/host/remove") return await host(req, res, "remove");
    if (req.method === "POST" && req.url === "/api/proxy") return await proxy(req, res);
    if (req.method === "POST" && req.url === "/api/run") return await runCommand(req, res);

    sendJson(res, 404, { ok: false, output: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, output: getErrorMessage(error) });
  }
}).listen(port, hostName, () => {
  console.log(`Infrastructure host bridge: http://${hostName}:${port}`);
});
