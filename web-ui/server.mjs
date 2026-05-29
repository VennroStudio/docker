#!/usr/bin/env node
import { createServer } from "node:http";
import { port } from "./server/config.mjs";
import { getErrorMessage, sendJson } from "./server/http.mjs";
import { meta } from "./server/meta-route.mjs";
import { databases, dumps, mariadbInstances, postgresInstances } from "./server/modules/database/routes.mjs";
import { homeStatus } from "./server/modules/home/routes.mjs";
import { nginxStatus } from "./server/modules/nginx/routes.mjs";
import { redisStatus } from "./server/modules/redis/routes.mjs";
import { minioStatus } from "./server/modules/minio/routes.mjs";
import { registryStatus } from "./server/modules/registry/routes.mjs";
import { sshServers } from "./server/modules/ssh/routes.mjs";
import { archives } from "./server/modules/utilities/routes.mjs";
import { generateEnv, settings } from "./server/settings-route.mjs";
import { serveStatic } from "./server/static.mjs";
import { isRunTerminalUpgrade, runTerminalUpgrade } from "./server/modules/terminal/run-terminal.mjs";
import { isTerminalUpgrade, terminalUpgrade } from "./server/modules/terminal/ssh-terminal.mjs";

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/status") return await homeStatus(req, res);
    if (req.method === "GET" && req.url === "/api/nginx/status") return await nginxStatus(req, res);
    if (req.method === "GET" && req.url.startsWith("/api/databases")) return await databases(req, res);
    if (req.method === "GET" && req.url.startsWith("/api/dumps")) return await dumps(req, res);
    if (req.method === "GET" && req.url === "/api/redis/status") return await redisStatus(req, res);
    if (req.method === "GET" && req.url === "/api/minio/status") return await minioStatus(req, res);
    if (req.method === "GET" && req.url === "/api/registry/status") return await registryStatus(req, res);
    if (req.method === "GET" && req.url === "/api/ssh/servers") return await sshServers(req, res);
    if (req.method === "GET" && req.url === "/api/archives") return await archives(req, res);
    if (req.method === "GET" && req.url === "/api/meta") return await meta(req, res);
    if (req.method === "GET" && req.url === "/api/mariadb/instances") return await mariadbInstances(req, res);
    if (req.method === "GET" && req.url === "/api/postgres/instances") return await postgresInstances(req, res);
    if ((req.method === "GET" || req.method === "PUT") && req.url === "/api/settings") return await settings(req, res);
    if (req.method === "POST" && req.url === "/api/settings/env") return await generateEnv(req, res);
    if (req.url.startsWith("/api/")) return sendJson(res, 404, { ok: false, output: "Not found" });
    if (req.method === "GET" || req.method === "HEAD") return await serveStatic(req, res);

    sendJson(res, 404, { ok: false, output: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, output: getErrorMessage(error) });
  }
});

server.on("upgrade", (req, socket, head) => {
  if (isRunTerminalUpgrade(req)) {
    runTerminalUpgrade(req, socket, head);
    return;
  }

  if (isTerminalUpgrade(req)) {
    terminalUpgrade(req, socket, head);
    return;
  }

  socket.destroy();
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Infrastructure UI: http://127.0.0.1:${port}`);
});
