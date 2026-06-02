import { mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { assert } from "../common/cli.mjs";
import {
  packageManagerList,
  projectConfigFile,
  projectComposeFile,
  projectMakefile,
  splitList,
  supportedRuntimes,
  unique,
} from "./common.mjs";

const webStacks = ["apache", "nginx-fpm", "node"];

const phpInstallableExtensions = new Set([
  "bcmath",
  "exif",
  "gd",
  "intl",
  "mysqli",
  "opcache",
  "pcntl",
  "pdo_mysql",
  "pdo_pgsql",
  "pgsql",
  "soap",
  "sockets",
  "xsl",
  "zip",
]);

const phpBuiltInExtensions = new Set([
  "ctype",
  "curl",
  "dom",
  "fileinfo",
  "iconv",
  "mbstring",
  "openssl",
  "phar",
  "session",
  "simplexml",
  "tokenizer",
  "xml",
  "xmlreader",
  "xmlwriter",
  "zlib",
]);

const phpPeclExtensions = new Set(["imagick", "redis"]);

const phpApkPackagesByExtension = {
  gd: ["libpng-dev", "libjpeg-turbo-dev", "freetype-dev", "libwebp-dev", "libavif-dev"],
  imagick: ["imagemagick-dev"],
  intl: ["icu-dev"],
  mysqli: ["mysql-dev"],
  pdo_mysql: ["mysql-dev"],
  pdo_pgsql: ["postgresql-dev"],
  pgsql: ["postgresql-dev"],
  soap: ["libxml2-dev"],
  xsl: ["libxslt-dev"],
  zip: ["libzip-dev"],
};

export async function generateProjectFiles(project) {
  await mkdir(project.path, { recursive: true });
  await rm(path.join(project.path, "Dockerfile"), { force: true });
  await removeInactiveGeneratedFiles(project);
  await writeFile(projectConfigFile(project), `${JSON.stringify(project, null, 2)}\n`, "utf8");
  await writeFile(projectComposeFile(project), composeFile(project), "utf8");
  await writeFile(projectMakefile(project), makefile(project), "utf8");

  if (project.web.stack === "nginx-fpm") await generateNginxFpmProject(project);
  else if (project.web.stack === "apache") await generateApacheProject(project);
  else if (project.web.stack === "node") await generateNodeProject(project);
}

async function removeInactiveGeneratedFiles(project) {
  const developmentDir = path.join(project.path, "docker/development");
  const stackDirs = {
    apache: ["nginx", "php-fpm", "php-cli", "node"],
    "nginx-fpm": ["apache", "node"],
    node: ["apache", "nginx", "php-fpm", "php-cli"],
  };

  for (const dir of stackDirs[project.web.stack] || []) {
    await rm(path.join(developmentDir, dir), { force: true, recursive: true });
  }

  if (project.web.stack === "node") {
    await rm(path.join(project.path, "docker/common/php"), { force: true, recursive: true });
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
    ...runtimeFromVersion(payload, "python", "PYTHON_VERSION"),
    ...runtimeFromVersion(payload, "go", "GO_VERSION"),
    ...runtimeFromVersion(payload, "java", "JAVA_VERSION"),
    ...runtimeFromVersion(payload, "dotnet", "DOTNET_VERSION"),
    ...runtimeFromVersion(payload, "ruby", "RUBY_VERSION"),
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
  const requested = unique([...runtimeListFromPayload(payload.runtimes), ...runtimeFromWeb(payload)]);
  validateList("RUNTIMES", requested, supportedRuntimes);

  for (const runtime of requested) {
    next[runtime] = normalizeRuntime(runtime, payload, catalog, next[runtime]);
  }

  for (const runtime of supportedRuntimes) {
    if (hasRuntimeInput(payload, runtime)) {
      next[runtime] = normalizeRuntime(runtime, payload, catalog, next[runtime]);
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
  const version = runtimeVersion(payload, runtime, current.version || defaults.defaultVersion || "latest");
  const result = {
    enabled: true,
    version,
  };

  if (runtime === "php") {
    const preset = payload.phpPreset || current.preset || "minimal";
    const presetExtensions = defaults.presets?.[preset] || [];
    assert(defaults.presets?.[preset], `Unknown PHP_PRESET: ${preset}`);
    const extraExtensions = splitList(payload.phpExtensions);
    result.preset = preset;
    result.extensions = unique([...presetExtensions, ...extraExtensions]).sort();
    result.packageManagers = packageManagerList(payload.phpPackageManagers || current.packageManagers?.join(",") || "composer");
    validateList("PHP_PACKAGE_MANAGERS", result.packageManagers, ["composer"]);
    validatePhpExtensions(result.extensions);
    return result;
  }

  if (runtime === "node") {
    result.packageManager = payload.nodePackageManager || current.packageManager || "npm";
    validateEnum("NODE_PACKAGE_MANAGER", result.packageManager, ["npm", "yarn", "pnpm"]);
    return result;
  }

  if (runtime === "python") {
    result.packageManager = payload.pythonPackageManager || current.packageManager || "pip";
    validateEnum("PYTHON_PACKAGE_MANAGER", result.packageManager, ["pip", "poetry", "uv"]);
    return result;
  }

  if (runtime === "java") {
    result.packageManager = payload.javaPackageManager || current.packageManager || "";
    if (result.packageManager) validateEnum("JAVA_PACKAGE_MANAGER", result.packageManager, ["maven", "gradle"]);
    return result;
  }

  if (runtime === "ruby") {
    result.packageManager = payload.rubyPackageManager || current.packageManager || "bundler";
    validateEnum("RUBY_PACKAGE_MANAGER", result.packageManager, ["bundler"]);
    return result;
  }

  return result;
}

function normalizeWeb(payload, runtimes, current = {}) {
  const stack = payload.webStack || current.stack || defaultWebStack(runtimes);
  validateEnum("WEB_STACK", stack, webStacks);

  const documentRoot = normalizeDocumentRoot(payload.documentRoot || current.documentRoot || defaultDocumentRoot(stack, runtimes));
  const web = {
    stack,
    documentRoot,
    proxyTarget: proxyTarget(stack, payload.name, current.proxyTarget),
    proxyPort: Number(payload.webPort || current.proxyPort || defaultWebPort(stack)),
  };

  if (stack === "node") {
    web.command = payload.webCommand || current.command || defaultNodeCommand(runtimes.node);
  }

  return web;
}

function validateWebRuntimes(web, runtimes) {
  if (web.stack === "apache" || web.stack === "nginx-fpm") {
    assert(runtimes.php, `${web.stack} requires PHP runtime`);
  }

  if (web.stack === "node") {
    assert(runtimes.node, "node web stack requires Node runtime");
    assert(web.proxyPort >= 1 && web.proxyPort <= 65535, "Invalid WEB_PORT");
    assert(web.command, "WEB_COMMAND is required for node web stack");
  }
}

function defaultWebStack(runtimes) {
  if (runtimes.php?.preset === "wordpress") return "apache";
  if (runtimes.php) return "nginx-fpm";
  if (runtimes.node) return "node";
  throw new Error("WEB_STACK is required for projects without PHP or Node");
}

function defaultDocumentRoot(stack, runtimes) {
  if (stack === "apache" && runtimes.php?.preset === "wordpress") return ".";
  if (stack === "apache") return ".";
  if (stack === "nginx-fpm") return "public";
  return ".";
}

function defaultWebPort(stack) {
  return stack === "node" ? 5173 : 80;
}

function defaultNodeCommand(runtime) {
  const manager = runtime?.packageManager || "npm";
  if (manager === "pnpm") return "pnpm dev --host 0.0.0.0";
  if (manager === "yarn") return "yarn dev --host 0.0.0.0";
  return "npm run dev -- --host 0.0.0.0";
}

function proxyTarget(stack, projectName, current) {
  if (current) return current;
  if (stack === "nginx-fpm") return `${projectName}-nginx`;
  return `${projectName}-container`;
}

function hasRuntimeInput(payload, runtime) {
  if (payload[`${runtime}Version`]) return true;
  if (runtime === "php") return Boolean(payload.phpPreset || payload.phpExtensions || payload.phpPackageManagers);
  if (runtime === "node") return Boolean(payload.nodePackageManager);
  if (runtime === "python") return Boolean(payload.pythonPackageManager);
  if (runtime === "java") return Boolean(payload.javaPackageManager);
  if (runtime === "ruby") return Boolean(payload.rubyPackageManager);
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
  if (runtime === "php" && (payload.phpPreset || payload.phpExtensions || payload.phpPackageManagers)) return [runtime];
  if (runtime === "node" && payload.nodePackageManager) return [runtime];
  if (runtime === "python" && payload.pythonPackageManager) return [runtime];
  if (runtime === "java" && payload.javaPackageManager) return [runtime];
  if (runtime === "ruby" && payload.rubyPackageManager) return [runtime];
  return [];
}

function runtimeFromWeb(payload) {
  if (payload.webStack === "apache" || payload.webStack === "nginx-fpm") return ["php"];
  if (payload.webStack === "node") return ["node"];
  return [];
}

function runtimeVersion(payload, runtime, fallback) {
  return payload[`${runtime}Version`] || payload[runtime.toUpperCase() + "_VERSION"] || fallback;
}

async function generateNginxFpmProject(project) {
  await writeIfMissing(path.join(project.path, ".env"), "");
  await writeIfMissing(path.join(project.path, project.web.documentRoot, "index.php"), defaultPhpIndex(project));
  await writeGenerated(path.join(project.path, "docker/common/php/conf.d/limit.ini"), phpLimitIni());
  await writeGenerated(path.join(project.path, "docker/common/php/conf.d/security.ini"), phpSecurityIni());
  await writeGenerated(path.join(project.path, "docker/development/nginx/Dockerfile"), nginxDockerfile());
  await writeGenerated(path.join(project.path, "docker/development/nginx/conf.d/default.conf"), nginxConfig(project));
  await writeGenerated(path.join(project.path, "docker/development/php-fpm/Dockerfile"), phpFpmDockerfile(project));
  await writeGenerated(path.join(project.path, "docker/development/php-cli/Dockerfile"), phpCliDockerfile(project));
}

async function generateApacheProject(project) {
  await writeIfMissing(path.join(project.path, ".env"), "");
  await writeIfMissing(path.join(project.path, project.web.documentRoot, "index.php"), defaultPhpIndex(project));
  await writeGenerated(path.join(project.path, "docker/common/php/conf.d/limit.ini"), phpLimitIni());
  await writeGenerated(path.join(project.path, "docker/common/php/conf.d/security.ini"), phpSecurityIni());
  await writeGenerated(path.join(project.path, "docker/development/apache/Dockerfile"), apacheDockerfile(project));
}

async function generateNodeProject(project) {
  await writeIfMissing(path.join(project.path, "package.json"), defaultPackageJson(project));
  await writeIfMissing(path.join(project.path, "index.html"), defaultHtml(project));
  await writeGenerated(path.join(project.path, "docker/development/node/Dockerfile"), nodeDockerfile(project.runtimes.node));
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
  if (project.web.stack === "nginx-fpm") return nginxFpmCompose(project);
  if (project.web.stack === "apache") return apacheCompose(project);
  return nodeCompose(project);
}

function nginxFpmCompose(project) {
  return `name: vennro

services:
  ${project.name}-nginx:
    container_name: ${project.name}-nginx
    build:
      context: docker
      dockerfile: development/nginx/Dockerfile
    volumes:
      - ./:/app
    depends_on:
      - ${project.name}-php-fpm
    networks:
      - proxy

  ${project.name}-php-fpm:
    container_name: ${project.name}-php-fpm
    build:
      context: docker
      dockerfile: development/php-fpm/Dockerfile
    env_file: .env
    volumes:
      - ./:/app
    networks:
      - proxy

  ${project.name}-php-cli:
    container_name: ${project.name}-php-cli
    build:
      context: docker
      dockerfile: development/php-cli/Dockerfile
    env_file: .env
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
    volumes:
      - ./:/var/www/html
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
    command: ${project.web.command}
    volumes:
      - ./:/app
    networks:
      - proxy

networks:
  proxy:
    external: true
`;
}

function makefile(project) {
  const shellService = project.web.stack === "nginx-fpm" ? `${project.name}-php-cli` : project.name;
  const buildServices = projectBuildServices(project).join(" ");
  const upServices = projectUpServices(project).join(" ");
  const imageNames = projectImageNames(project).join(" ");

  return `COMPOSE = docker compose -f docker-compose.yml
SHELL_SERVICE = ${shellService}
BUILD_SERVICES = ${buildServices}
UP_SERVICES = ${upServices}
IMAGE_NAMES = ${imageNames}

.PHONY: help proxy-network-ensure shell up down build logs logs-follow clean status

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

shell: proxy-network-ensure build ## Открыть shell внутри web-проекта
\t$(COMPOSE) run --rm $(SHELL_SERVICE) sh

up: proxy-network-ensure build ## Запустить сайт
\t$(COMPOSE) up -d $(UP_SERVICES)

down: ## Остановить сайт
\t$(COMPOSE) stop $(BUILD_SERVICES)
\t$(COMPOSE) rm -f $(BUILD_SERVICES)

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
  if (project.web.stack === "nginx-fpm") {
    return [`${project.name}-nginx`, `${project.name}-php-fpm`, `${project.name}-php-cli`];
  }

  return [project.name];
}

function projectUpServices(project) {
  if (project.web.stack === "nginx-fpm") {
    return [`${project.name}-nginx`, `${project.name}-php-fpm`];
  }

  return [project.name];
}

function projectImageNames(project) {
  return projectBuildServices(project).map((service) => `vennro-${service}:latest`);
}

function nginxDockerfile() {
  return `FROM nginx:alpine

COPY ./development/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /app
`;
}

function nginxConfig(project) {
  return `server {
    listen 80;
    server_name localhost;
    root /app/${project.web.documentRoot};
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        fastcgi_pass ${project.name}-php-fpm:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
`;
}

function phpFpmDockerfile(project) {
  return phpDockerfile(project, "fpm");
}

function phpCliDockerfile(project) {
  return phpDockerfile(project, "cli", { composer: true, node: Boolean(project.runtimes.node) });
}

function apacheDockerfile(project) {
  const runtime = project.runtimes.php;
  const lines = [`FROM php:${runtime.version}-apache-bookworm`, ""];
  const aptPackages = phpAptPackages(runtime.extensions, { node: Boolean(project.runtimes.node), apache: true });
  const installable = runtime.extensions.filter((extension) => phpInstallableExtensions.has(extension));
  const pecl = runtime.extensions.filter((extension) => phpPeclExtensions.has(extension));

  lines.push("RUN apt-get update \\");
  lines.push(`  && apt-get install -y --no-install-recommends ${aptPackages.join(" ")} \\`);
  if (pecl.length) lines.push(`  && pecl install ${pecl.join(" ")} \\`);
  if (installable.includes("gd")) {
    lines.push("  && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --with-avif \\");
  }
  if (installable.length) lines.push(`  && docker-php-ext-install ${installable.join(" ")} \\`);
  if (pecl.length) lines.push(`  && docker-php-ext-enable ${pecl.join(" ")} \\`);
  lines.push("  && rm -rf /var/lib/apt/lists/*", "");
  lines.push("RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini", "");
  lines.push("COPY ./common/php/conf.d /usr/local/etc/php/conf.d", "");

  if (runtime.packageManagers?.includes("composer")) {
    lines.push("ENV COMPOSER_ALLOW_SUPERUSER=1", "");
    lines.push("RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/bin --filename=composer --version=2.10.0 --quiet", "");
  }

  if (project.runtimes.node) {
    lines.push(...nodeRuntimeDebian(project.runtimes.node), "");
    lines.push(...nodePackageManager(project.runtimes.node), "");
  }

  lines.push(`ENV APACHE_DOCUMENT_ROOT=${apacheDocumentRoot(project.web.documentRoot)}`, "");
  lines.push("RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf", "");
  lines.push("WORKDIR /var/www/html", "");
  return compactBlankLines(lines).join("\n");
}

function phpDockerfile(project, sapi, options = {}) {
  const runtime = project.runtimes.php;
  const lines = [`FROM php:${runtime.version}-${sapi}-bookworm`, ""];
  const aptPackages = phpAptPackages(runtime.extensions, options);
  const installable = runtime.extensions.filter((extension) => phpInstallableExtensions.has(extension));
  const pecl = runtime.extensions.filter((extension) => phpPeclExtensions.has(extension));

  lines.push("RUN apt-get update \\");
  lines.push(`  && apt-get install -y --no-install-recommends ${aptPackages.join(" ")} \\`);
  if (pecl.length) lines.push(`  && pecl install ${pecl.join(" ")} \\`);
  if (installable.includes("gd")) {
    lines.push("  && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp --with-avif \\");
  }
  if (installable.length) lines.push(`  && docker-php-ext-install ${installable.join(" ")} \\`);
  if (pecl.length) lines.push(`  && docker-php-ext-enable ${pecl.join(" ")} \\`);
  lines.push("  && rm -rf /var/lib/apt/lists/*", "");
  lines.push("RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini", "");
  lines.push("COPY ./common/php/conf.d /usr/local/etc/php/conf.d", "");

  if (options.composer && runtime.packageManagers?.includes("composer")) {
    lines.push("ENV COMPOSER_ALLOW_SUPERUSER=1", "");
    lines.push("RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/bin --filename=composer --version=2.10.0 --quiet", "");
  }

  if (options.node) {
    lines.push(...nodeRuntimeDebian(project.runtimes.node), "");
    lines.push(...nodePackageManager(project.runtimes.node), "");
  }

  lines.push("WORKDIR /app", "");
  return compactBlankLines(lines).join("\n");
}

function phpApkPackages(extensions, options = {}) {
  const packages = unique([
    "bash",
    "curl",
    "git",
    "linux-headers",
    "unzip",
    ...extensions.flatMap((extension) => phpApkPackagesByExtension[extension] || []),
  ]);
  if (options.node) packages.push("libstdc++");
  return unique(packages).sort();
}

function nodeDockerfile(runtime) {
  const lines = [`FROM node:${runtime.version}-alpine`, "", "WORKDIR /app", ""];
  lines.push(...nodePackageManager(runtime), "");
  return compactBlankLines(lines).join("\n");
}

function nodeRuntimeAlpine(runtime) {
  return [
    `COPY --from=node:${runtime.version}-alpine /usr/local/bin/node /usr/local/bin/node`,
    `COPY --from=node:${runtime.version}-alpine /usr/local/lib/node_modules /usr/local/lib/node_modules`,
    "RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \\",
    "    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx",
  ];
}

function nodeRuntimeDebian(runtime) {
  return [
    `COPY --from=node:${runtime.version}-bookworm /usr/local/bin/node /usr/local/bin/node`,
    `COPY --from=node:${runtime.version}-bookworm /usr/local/lib/node_modules /usr/local/lib/node_modules`,
    "RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \\",
    "    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx",
  ];
}

function apacheDocumentRoot(documentRoot) {
  return documentRoot === "." ? "/var/www/html" : `/var/www/html/${documentRoot}`;
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
        dev: `vite --host 0.0.0.0 --port ${project.web.proxyPort}`,
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

function phpLimitIni() {
  return `memory_limit = 512M
upload_max_filesize = 128M
post_max_size = 128M
max_execution_time = 300
max_input_time = 300
`;
}

function phpSecurityIni() {
  return `log_errors = on
error_log = /var/log/php_errors.log
`;
}

function normalizeDocumentRoot(value) {
  const root = String(value || "").trim() || ".";
  assert(!path.isAbsolute(root), "DOCUMENT_ROOT must be relative");
  assert(!root.split(/[\\/]+/).includes(".."), "DOCUMENT_ROOT must not contain ..");
  return root.replace(/^\.\/+/, "") || ".";
}

function validatePhpExtensions(extensions) {
  const unknown = extensions.filter(
    (extension) =>
      !phpInstallableExtensions.has(extension) &&
      !phpBuiltInExtensions.has(extension) &&
      !phpPeclExtensions.has(extension),
  );
  assert(!unknown.length, `Unsupported PHP_EXTENSIONS: ${unknown.join(", ")}`);
}

function validateList(name, values, allowed) {
  const unknown = values.filter((value) => !allowed.includes(value));
  assert(!unknown.length, `Unknown ${name}: ${unknown.join(", ")}`);
}

function validateEnum(name, value, allowed) {
  assert(allowed.includes(value), `Unknown ${name}: ${value}`);
}

function phpAptPackages(extensions, options = {}) {
  const packages = unique([
    "bash",
    "ca-certificates",
    "curl",
    "git",
    "unzip",
    ...extensions.flatMap((extension) => phpAptPackagesByExtension(extension)),
  ]);
  if (extensions.some((extension) => phpPeclExtensions.has(extension))) packages.push("$PHPIZE_DEPS");
  if (options.node) packages.push("libstdc++6");
  return unique(packages).sort();
}

function phpAptPackagesByExtension(extension) {
  const packages = {
    gd: ["libpng-dev", "libjpeg-dev", "libfreetype6-dev", "libwebp-dev", "libavif-dev"],
    imagick: ["libmagickwand-dev"],
    intl: ["libicu-dev"],
    mysqli: ["default-libmysqlclient-dev"],
    pdo_mysql: ["default-libmysqlclient-dev"],
    pdo_pgsql: ["libpq-dev"],
    pgsql: ["libpq-dev"],
    soap: ["libxml2-dev"],
    xsl: ["libxslt1-dev"],
    zip: ["libzip-dev"],
  };
  return packages[extension] || [];
}

function compactBlankLines(lines) {
  const result = [];
  for (const line of lines) {
    if (line === "" && result.at(-1) === "") continue;
    result.push(line);
  }
  return result;
}
