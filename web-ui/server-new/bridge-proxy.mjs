import http from "node:http";
import https from "node:https";
import { getErrorMessage, sendJson } from "./http.mjs";

const nginxContainer = "nginx-container";

export function isHostBridgeRoute(req) {
  const url = new URL(req.url, "http://localhost");
  const bridgePaths = new Set([
    "/api/host/add",
    "/api/host/remove",
    "/api/nginx/status",
    "/api/proxy",
    "/api/run",
    "/api/settings",
    "/api/settings/env",
    "/api/stream/host",
    "/api/stream/proxy",
    "/api/stream/proxy-delete",
    "/api/stream/run",
    "/api/stream/shell/input",
    "/api/stream/shell/stop",
  ]);

  if (bridgePaths.has(url.pathname)) return true;
  return url.pathname === "/api/stream/shell" && url.searchParams.get("container") === nginxContainer;
}

export function proxyToHostBridge(req, res) {
  const bridgeUrl = process.env.HOST_BRIDGE_URL;
  if (!bridgeUrl) {
    sendJson(res, 503, {
      ok: false,
      output: "HOST_BRIDGE_URL is not configured. Start host bridge and pass its URL to web-ui.",
    });
    return;
  }

  const target = new URL(req.url, bridgeUrl);
  const transport = target.protocol === "https:" ? https : http;
  const headers = { ...req.headers, host: target.host };

  const bridgeReq = transport.request(
    target,
    {
      headers,
      method: req.method,
    },
    (bridgeRes) => {
      res.writeHead(bridgeRes.statusCode || 502, bridgeRes.headers);
      bridgeRes.pipe(res);
    },
  );

  bridgeReq.on("error", (error) => {
    if (res.headersSent) {
      res.end(`\n${getErrorMessage(error)}\n`);
      return;
    }

    sendJson(res, 502, {
      ok: false,
      output: `Host bridge is not available: ${getErrorMessage(error)}`,
    });
  });

  req.pipe(bridgeReq);
}
