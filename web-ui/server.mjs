#!/usr/bin/env node
import { createServer } from "node:http";
import { host, port, publicHost } from "./server/config.mjs";
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
import { isAllowedTerminalUpgrade, rejectTerminalUpgrade } from "./server/modules/terminal/security.mjs";
import { isTerminalUpgrade, terminalUpgrade } from "./server/modules/terminal/ssh-terminal.mjs";

const server = createServer(async (req, res) => {
  try {
    const pathname = requestPath(req);

    if (req.method === "GET" && pathname === "/api/status") return await homeStatus(req, res);
    if (req.method === "GET" && pathname === "/api/nginx/status") return await nginxStatus(req, res);
    if (req.method === "GET" && pathname.startsWith("/api/databases")) return await databases(req, res);
    if (req.method === "GET" && pathname.startsWith("/api/dumps")) return await dumps(req, res);
    if (req.method === "GET" && pathname === "/api/redis/status") return await redisStatus(req, res);
    if (req.method === "GET" && pathname === "/api/minio/status") return await minioStatus(req, res);
    if (req.method === "GET" && pathname === "/api/registry/status") return await registryStatus(req, res);
    if (req.method === "GET" && pathname === "/api/ssh/servers") return await sshServers(req, res);
    if (req.method === "GET" && pathname === "/api/archives") return await archives(req, res);
    if (req.method === "GET" && pathname === "/api/meta") return await meta(req, res);
    if (req.method === "GET" && pathname === "/api/mariadb/instances") return await mariadbInstances(req, res);
    if (req.method === "GET" && pathname === "/api/postgres/instances") return await postgresInstances(req, res);
    if ((req.method === "GET" || req.method === "PUT") && pathname === "/api/settings") return await settings(req, res);
    if (req.method === "POST" && pathname === "/api/settings/env") return await generateEnv(req, res);
    if (pathname.startsWith("/api/")) return sendJson(res, 404, { ok: false, output: "Not found" });
    if (req.method === "GET" || req.method === "HEAD") return await serveStatic(req, res);

    sendJson(res, 404, { ok: false, output: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, output: getErrorMessage(error) });
  }
});

server.on("upgrade", (req, socket, head) => {
  if (isRunTerminalUpgrade(req)) {
    if (!isAllowedTerminalUpgrade(req)) return rejectTerminalUpgrade(socket);
    runTerminalUpgrade(req, socket, head);
    return;
  }

  if (isTerminalUpgrade(req)) {
    if (!isAllowedTerminalUpgrade(req)) return rejectTerminalUpgrade(socket);
    terminalUpgrade(req, socket, head);
    return;
  }

  socket.destroy();
});

server.listen(port, host, () => {
  console.log(`Infrastructure UI: http://${publicHost}:${port}`);
});

function requestPath(req) {
  return new URL(req.url || "/", "http://localhost").pathname;
}
