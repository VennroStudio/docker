import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { assert } from "../common/cli.mjs";
import {
  projectConfigFile,
  projectComposeFile,
  projectMakefile,
  supportedRuntimes,
  unique,
} from "./common.mjs";

const webStacks = ["apache", "nginx", "node"];

export async function generateProjectFiles(project) {
  await mkdir(project.path, { recursive: true });
  await rm(path.join(project.path, "Dockerfile"), { force: true });
  await removeInactiveGeneratedFiles(project);
  await writeFile(
    projectConfigFile(project),
    `${JSON.stringify(project, null, 2)}\n`,
    "utf8",
  );
  await writeFile(projectComposeFile(project), composeFile(project), "utf8");
  await writeFile(projectMakefile(project), makefile(project), "utf8");

  if (project.web.stack === "nginx") await generateNginxProject(project);
  else if (project.web.stack === "apache") await generateApacheProject(project);
  else if (project.web.stack === "node") await generateNodeProject(project);
}

async function removeInactiveGeneratedFiles(project) {
  const developmentDir = path.join(project.path, "docker/development");
  const stackDirs = {
    apache: ["nginx", "node"],
    nginx: ["apache", "node"],
    node: ["apache", "nginx"],
  };

  for (const dir of stackDirs[project.web.stack] || []) {
    await rm(path.join(developmentDir, dir), { force: true, recursive: true });
  }

}

export function normalizeProjectConfig(payload, catalog, current = {}) {
  const runtimes = current.runtimes
    ? mergeRuntimes(current.runtimes, payload, catalog)
    : normalizeRuntimes(payload, catalog);
  const web = normalizeWeb(payload, runtimes, current.web);

  validateWebRuntimes(web, runtimes);

  return { runtimes, web };
}

export function normalizeRuntimes(payload, catalog) {
  const requested = unique([
    ...runtimeListFromPayload(payload.runtimes),
    ...runtimeFromVersion(payload, "php", "PHP_VERSION"),
    ...runtimeFromVersion(payload, "node", "NODE_VERSION"),
    ...runtimeFromWeb(payload),
  ]);
  validateList("RUNTIMES", requested, supportedRuntimes);

  const runtimes = {};
  for (const runtime of requested) {
    runtimes[runtime] = normalizeRuntime(runtime, payload, catalog);
  }

  return runtimes;
}

export function mergeRuntimes(current, payload, catalog) {
  const next = { ...current };
  const requested = unique([
    ...runtimeListFromPayload(payload.runtimes),
    ...runtimeFromWeb(payload),
  ]);
  validateList("RUNTIMES", requested, supportedRuntimes);

  for (const runtime of requested) {
    next[runtime] = normalizeRuntime(runtime, payload, catalog, next[runtime]);
  }

  for (const runtime of supportedRuntimes) {
    if (hasRuntimeInput(payload, runtime)) {
      next[runtime] = normalizeRuntime(
        runtime,
        payload,
        catalog,
        next[runtime],
      );
    }
  }

  const removeRuntimes = runtimeListFromPayload(payload.removeRuntimes);
  validateList("REMOVE_RUNTIMES", removeRuntimes, supportedRuntimes);

  for (const runtime of removeRuntimes) {
    delete next[runtime];
  }

  return next;
}

export function projectConfigChanged(left = {}, right = {}) {
  return JSON.stringify(left) !== JSON.stringify(right);
}

function normalizeRuntime(runtime, payload, catalog, current = {}) {
  const defaults = catalog[runtime] || {};
  const version = runtimeVersion(
    payload,
    runtime,
    current.version || defaults.defaultVersion || "latest",
  );
  const result = {
    enabled: true,
    version,
  };

  if (runtime === "php") {
    return result;
  }

  if (runtime === "node") {
    result.packageManager =
      payload.nodePackageManager || current.packageManager || "npm";
    validateEnum("NODE_PACKAGE_MANAGER", result.packageManager, [
      "npm",
      "yarn",
      "pnpm",
    ]);
    return result;
  }

  return result;
}

function normalizeWeb(payload, runtimes, current = {}) {
  const stack = payload.webStack || current.stack || defaultWebStack(runtimes);
  validateEnum("WEB_STACK", stack, webStacks);

  const documentRoot = normalizeDocumentRoot(
    payload.documentRoot ||
      current.documentRoot ||
      defaultDocumentRoot(stack),
  );
  const target = proxyTarget(stack, payload.name);
  const web = {
    stack,
    documentRoot,
    proxyTarget: target,
    proxyPort: Number(
      payload.webPort || current.proxyPort || defaultWebPort(stack),
    ),
  };

  if (current.url && current.proxyTarget === target) web.url = current.url;

  if (stack === "node") {
    web.command = normalizeNodeCommand(payload, current, runtimes.node);
  }

  return web;
}

function validateWebRuntimes(web, runtimes) {
  if (web.stack === "apache" || web.stack === "nginx") {
    assert(runtimes.php, `${web.stack} requires PHP runtime`);
  }

  if (web.stack === "node") {
    assert(runtimes.node, "node web stack requires Node runtime");
    assert(web.proxyPort >= 1 && web.proxyPort <= 65535, "Invalid WEB_PORT");
    assert(web.command, "WEB_COMMAND is required for node web stack");
  }
}

function defaultWebStack(runtimes) {
  if (runtimes.php) return "nginx";
  if (runtimes.node) return "node";
  throw new Error("WEB_STACK is required for projects without PHP or Node");
}

function defaultDocumentRoot(stack) {
  if (stack === "apache") return ".";
  if (stack === "nginx") return "public";
  return ".";
}

function defaultWebPort(stack) {
  return stack === "node" ? 5173 : 80;
}

function defaultNodeCommand(runtime) {
  const manager = runtime?.packageManager || "npm";
  if (manager === "pnpm") return `sh -lc "pnpm install && pnpm dev"`;
  if (manager === "yarn") return `sh -lc "yarn install && yarn dev"`;
  return `sh -lc "npm install && npm run dev"`;
}

function normalizeNodeCommand(payload, current, runtime) {
  if (payload.webCommand) return payload.webCommand;
  if (current.command && !isLegacyDefaultNodeCommand(current.command))
    return current.command;
  return defaultNodeCommand(runtime);
}

function isLegacyDefaultNodeCommand(command) {
  return [
    "npm run dev -- --host 0.0.0.0",
    "pnpm dev --host 0.0.0.0",
    "yarn dev --host 0.0.0.0",
  ].includes(command);
}

function proxyTarget(stack, projectName) {
  return `${projectName}-container`;
}

function hasRuntimeInput(payload, runtime) {
  if (payload[`${runtime}Version`]) return true;
  if (runtime === "node") return Boolean(payload.nodePackageManager);
  return false;
}

function runtimeListFromPayload(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function runtimeFromVersion(payload, runtime, key) {
  if (payload[key] || payload[`${runtime}Version`]) return [runtime];
  if (runtime === "node" && payload.nodePackageManager) return [runtime];
  return [];
}

function runtimeFromWeb(payload) {
  if (payload.webStack === "apache" || payload.webStack === "nginx")
    return ["php"];
  if (payload.webStack === "node") return ["node"];
  return [];
}

function runtimeVersion(payload, runtime, fallback) {
  return (
    payload[`${runtime}Version`] ||
    payload[runtime.toUpperCase() + "_VERSION"] ||
    fallback
  );
}

async function generateNginxProject(project) {
  await writeIfMissing(path.join(project.path, ".env"), "");
  await writeIfMissing(
    path.join(project.path, project.web.documentRoot, "index.php"),
    defaultPhpIndex(project),
  );
  await writeGenerated(
    path.join(project.path, "docker/development/nginx/Dockerfile"),
    phpWebDockerfile(project, "nginx"),
  );
}

async function generateApacheProject(project) {
  await writeIfMissing(path.join(project.path, ".env"), "");
  await writeIfMissing(
    path.join(project.path, project.web.documentRoot, "index.php"),
    defaultPhpIndex(project),
  );
  await writeGenerated(
    path.join(project.path, "docker/development/apache/Dockerfile"),
    phpWebDockerfile(project, "apache"),
  );
}

async function generateNodeProject(project) {
  await writeIfMissing(
    path.join(project.path, "package.json"),
    defaultPackageJson(project),
  );
  await writeIfMissing(
    path.join(project.path, "vite.config.mjs"),
    defaultViteConfig(project),
  );
  await writeIfMissing(
    path.join(project.path, "index.html"),
    defaultHtml(project),
  );
  await writeGenerated(
    path.join(project.path, "docker/development/node/Dockerfile"),
    nodeDockerfile(project.runtimes.node),
  );
}

async function writeGenerated(file, content) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content, "utf8");
}

async function writeIfMissing(file, content) {
  if (existsSync(file)) return;
  await writeGenerated(file, content);
}

function composeFile(project) {
  if (project.web.stack === "nginx") return nginxCompose(project);
  if (project.web.stack === "apache") return apacheCompose(project);
  return nodeCompose(project);
}

function nginxCompose(project) {
  return `name: vennro

services:
  ${project.name}:
    container_name: ${project.name}-container
    build:
      context: docker
      dockerfile: development/nginx/Dockerfile
    env_file: .env
    environment:
      WEB_DOCUMENT_ROOT: /app/${project.web.documentRoot}
    volumes:
      - ./:/app
    networks:
      - proxy

networks:
  proxy:
    external: true
`;
}

function apacheCompose(project) {
  return `name: vennro

services:
  ${project.name}:
    container_name: ${project.name}-container
    build:
      context: docker
      dockerfile: development/apache/Dockerfile
    env_file: .env
    environment:
      WEB_DOCUMENT_ROOT: ${apacheDocumentRoot(project.web.documentRoot)}
    volumes:
      - ./:/app
    networks:
      - proxy

networks:
  proxy:
    external: true
`;
}

function nodeCompose(project) {
  return `name: vennro

services:
  ${project.name}:
    container_name: ${project.name}-container
    build:
      context: docker
      dockerfile: development/node/Dockerfile
    working_dir: /app
    command: ${yamlString(project.web.command)}
    volumes:
      - ./:/app
    networks:
      - proxy

networks:
  proxy:
    external: true
`;
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function makefile(project) {
  const shellService = project.name;
  const buildServices = projectBuildServices(project).join(" ");
  const upServices = projectUpServices(project).join(" ");
  const imageNames = projectImageNames(project).join(" ");

  return `COMPOSE = docker compose -f docker-compose.yml
SHELL_SERVICE = ${shellService}
BUILD_SERVICES = ${buildServices}
UP_SERVICES = ${upServices}
IMAGE_NAMES = ${imageNames}

.PHONY: help proxy-network-ensure shell up down start stop build logs logs-follow clean status

help: ## Показать список команд
\t@echo ""
\t@awk 'BEGIN {FS = ":.*?## "} \\
\t\t/^##@/ { printf "\\n\\033[1m%s\\033[0m\\n", substr($$0, 5) } \\
\t\t/^[a-zA-Z_-]+:.*?## / { printf "  \\033[36m%-15s\\033[0m %s\\n", $$1, $$2 }' \\
\t\t$(MAKEFILE_LIST)
\t@echo ""

##@ Project
proxy-network-ensure: ## Создать общую сеть proxy, если ее еще нет
\t@docker network inspect proxy >/dev/null 2>&1 || docker network create proxy

shell: proxy-network-ensure ## Открыть shell внутри web-проекта
\t$(COMPOSE) run --rm $(SHELL_SERVICE) sh

up: proxy-network-ensure build ## Запустить сайт
\t$(COMPOSE) up -d $(UP_SERVICES)

down: ## Остановить сайт
\t$(COMPOSE) stop $(BUILD_SERVICES)
\t$(COMPOSE) rm -f $(BUILD_SERVICES)

start: ## Запустить существующие контейнеры сайта
\t$(COMPOSE) start $(UP_SERVICES)

stop: ## Остановить сайт без удаления контейнеров
\t$(COMPOSE) stop $(UP_SERVICES)

build: ## Собрать Docker image сайта
\t$(COMPOSE) build $(BUILD_SERVICES)

logs: ## Показать логи сайта
\t$(COMPOSE) logs --tail=200 $(UP_SERVICES)

logs-follow: ## Смотреть живые логи сайта
\t$(COMPOSE) logs -f $(UP_SERVICES)

clean: ## Остановить сайт и удалить его контейнеры/image
\t$(COMPOSE) stop $(BUILD_SERVICES)
\t$(COMPOSE) rm -f -v $(BUILD_SERVICES)
\tdocker rmi $(IMAGE_NAMES) 2>/dev/null || true

status: ## Показать статус сайта
\t$(COMPOSE) ps $(BUILD_SERVICES)
`;
}

function projectBuildServices(project) {
  return [project.name];
}

function projectUpServices(project) {
  return [project.name];
}

function projectImageNames(project) {
  return projectBuildServices(project).map(
    (service) => `vennro-${service}:latest`,
  );
}

function phpWebDockerfile(project, server) {
  const runtime = project.runtimes.php;
  const lines = [`FROM ${phpWebImage(runtime.version, server)}`, ""];
  lines.push("ENV COMPOSER_ALLOW_SUPERUSER=1", "");
  lines.push("RUN rm -f /usr/local/etc/php/conf.d/00-ioncube.ini", "");

  if (project.runtimes.node) {
    lines.push(...nodeRuntimeDebian(project.runtimes.node), "");
    lines.push(...nodePackageManager(project.runtimes.node), "");
  }

  lines.push("WORKDIR /app", "");
  return compactBlankLines(lines).join("\n");
}

function nodeDockerfile(runtime) {
  const lines = [`FROM node:${runtime.version}-alpine`, "", "WORKDIR /app", ""];
  lines.push(...nodePackageManager(runtime), "");
  return compactBlankLines(lines).join("\n");
}

function nodeRuntimeDebian(runtime) {
  return [
    `COPY --from=${nodeDebianImage(runtime.version)} /usr/local/bin/node /usr/local/bin/node`,
    `COPY --from=${nodeDebianImage(runtime.version)} /usr/local/lib/node_modules /usr/local/lib/node_modules`,
    "RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \\",
    "    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx",
  ];
}

function phpWebImage(version, server) {
  return `webdevops/php-${server}-dev:${version}`;
}

function nodeDebianImage(version) {
  if (Number(version) >= 20) return `node:${version}-bookworm`;
  return `node:${version}`;
}

function apacheDocumentRoot(documentRoot) {
  return documentRoot === "."
    ? "/app"
    : `/app/${documentRoot}`;
}

function nodePackageManager(runtime) {
  if (!["yarn", "pnpm"].includes(runtime.packageManager)) return [];
  return [`RUN npm install -g ${runtime.packageManager}`];
}

function defaultPhpIndex(project) {
  return `<?php

echo json_encode([
    'project' => '${project.name}',
    'php' => PHP_VERSION,
    'stack' => '${project.web.stack}',
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
`;
}

function defaultPackageJson(project) {
  return `${JSON.stringify(
    {
      scripts: {
        dev: "vite",
      },
      dependencies: {
        "@vitejs/plugin-react": "latest",
        vite: "latest",
        typescript: "latest",
      },
      devDependencies: {},
    },
    null,
    2,
  )}\n`;
}

function defaultViteConfig(project) {
  return `import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: true,
    host: "0.0.0.0",
    port: ${project.web.proxyPort},
  },
});
`;
}

function defaultHtml(project) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
  </head>
  <body>
    <main>
      <h1>${project.name}</h1>
    </main>
  </body>
</html>
`;
}

function normalizeDocumentRoot(value) {
  const root = String(value || "").trim() || ".";
  assert(!path.isAbsolute(root), "DOCUMENT_ROOT must be relative");
  assert(
    !root.split(/[\\/]+/).includes(".."),
    "DOCUMENT_ROOT must not contain ..",
  );
  return root.replace(/^\.\/+/, "") || ".";
}

function validateList(name, values, allowed) {
  const unknown = values.filter((value) => !allowed.includes(value));
  assert(!unknown.length, `Unknown ${name}: ${unknown.join(", ")}`);
}

function validateEnum(name, value, allowed) {
  assert(allowed.includes(value), `Unknown ${name}: ${value}`);
}

function compactBlankLines(lines) {
  const result = [];
  for (const line of lines) {
    if (line === "" && result.at(-1) === "") continue;
    result.push(line);
  }
  return result;
}
