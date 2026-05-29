import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const manifestUrl = new URL("../commands.manifest.json", import.meta.url);
const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export const commandManifest = JSON.parse(readFileSync(manifestUrl, "utf8"));
export const host = process.env.UI_HOST || "127.0.0.1";
export const port = Number(process.env.UI_PORT || 8088);
export const publicHost = host === "0.0.0.0" ? "127.0.0.1" : host;
export const terminalSessionLimit = Number(process.env.UI_TERMINAL_SESSION_LIMIT || 8);
export const projectRoot = process.cwd();
export const staticRoot = path.resolve(process.env.UI_STATIC_DIR || path.join(moduleDir, "../dist"));
export const commandMap = Object.fromEntries(
  Object.entries(commandManifest.commands).map(([id, command]) => [id, ["make", ...command.make]]),
);
export const serviceContainers = commandManifest.services;
export const shellGroups = commandManifest.shells;

export const staticTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};
