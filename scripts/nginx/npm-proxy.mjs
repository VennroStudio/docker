#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { assert, bool, parseArgs } from "../common/cli.mjs";
import {
  defaultSettingsFile,
  readJson,
  readSettings,
  settingsValue,
  writeSettings,
} from "../common/settings.mjs";
import {
  projectConfigFile,
  readProjectsStore,
  writeJson as writeProjectJson,
  writeProjectsStore,
} from "../projects/common.mjs";

process.on("uncaughtException", fail);
process.on("unhandledRejection", fail);

const args = parseArgs(process.argv.slice(2));
const deleting = bool(args.delete ?? args.remove ?? process.env.DELETE_PROXY);
const settings = await readSettings();
const publicTargets = {
  "nginx-container": {
    group: "proxy",
    key: "npmUrl",
    name: "proxy.npmUrl",
  },
  "phpmyadmin-container": {
    group: "phpmyadmin",
    key: "pmaUrl",
    name: "phpmyadmin.pmaUrl",
  },
  "pgadmin-container": {
    group: "pgadmin",
    key: "pgaUrl",
    name: "pgadmin.pgaUrl",
  },
  "redisinsight-container": {
    group: "redisinsight",
    key: "riUrl",
    name: "redisinsight.riUrl",
  },
  "rustfs-container": {
    group: "rustfs",
    key: "rustfsUrl",
    name: "rustfs.rustfsUrl",
    path: "/rustfs/console/",
  },
  "registry-container": {
    group: "registry",
    key: "registryUrl",
    name: "registry.registryUrl",
  },
  "registry-ui-container": {
    group: "registry",
    key: "registryUiUrl",
    name: "registry.registryUiUrl",
  },
};
const config = {
  delete: deleting,
  domain: need(args.domain || process.env.DOMAIN, "DOMAIN"),
  target: deleting ? "" : need(args.target || process.env.TARGET, "TARGET"),
  port: deleting ? 0 : Number(need(args.port || process.env.PORT, "PORT")),
  scheme: args.scheme || process.env.SCHEME || "http",
  ssl: bool(args.ssl ?? process.env.SSL),
  npmUrl: trimSlash(need(settings.proxy?.npmUrl, "proxy.npmUrl")),
  npmApiUrl: trimSlash(process.env.INFRA_NPM_API_URL || "http://localhost:81"),
  npmEmail: need(settings.proxy?.npmEmail, "proxy.npmEmail"),
  npmPassword: need(settings.proxy?.npmPassword, "proxy.npmPassword"),
  certDir: process.env.CERT_DIR || "certs",
  certDays: Number(process.env.CERT_DAYS || "825"),
  forceCert: bool(args["force-cert"] ?? process.env.FORCE_CERT),
};

let token;

validate(config);
await main();

async function main() {
  await getToken();

  if (config.delete) {
    await deleteProxyHostAndCertificate();
    await resetPublicUrlsForDomain();
    return;
  }

  const certificateId = config.ssl
    ? await uploadCertificate(await ensureCertificateFiles())
    : 0;

  const host = await upsertProxyHost(certificateId);
  await updatePublicUrl();
  await updateProjectPublicUrl();
  console.log(
    `Proxy Host #${host.id}: ${config.domain} -> ${config.target}:${config.port}`,
  );
  console.log(`Open: ${config.ssl ? "https" : "http"}://${config.domain}`);
}

function validate({ delete: deleting, domain, target, port }) {
  assert(/^[a-zA-Z0-9.-]+$/.test(domain), `Invalid DOMAIN: ${domain}`);
  if (deleting) return;

  assert(/^[a-zA-Z0-9._-]+$/.test(target), `Invalid TARGET: ${target}`);
  assert(
    Number.isInteger(port) && port > 0 && port <= 65535,
    `Invalid PORT: ${port}`,
  );
}

function need(value, name) {
  if (!value) {
    throw new Error(
      `Missing ${name}. Example: make app-proxy DOMAIN=pma.local TARGET=phpmyadmin-container PORT=80`,
    );
  }

  return value;
}

function trimSlash(value) {
  return value.replace(/\/+$/, "");
}

function fail(error) {
  console.error(error.message || String(error));
  process.exit(1);
}

async function ensureCertificateFiles() {
  await mkdir(config.certDir, { recursive: true });

  const certPath = path.join(config.certDir, `${config.domain}.crt`);
  const keyPath = path.join(config.certDir, `${config.domain}.key`);

  if (
    !config.forceCert &&
    (await exists(certPath)) &&
    (await exists(keyPath))
  ) {
    console.log(`Using existing certificate: ${certPath}`);
    return { certPath, keyPath };
  }

  if (hasCommand("mkcert")) {
    console.log(
      `Generating trusted local certificate with mkcert for ${config.domain}`,
    );
    run("mkcert", ["-install"]);
    run("mkcert", [
      "-cert-file",
      certPath,
      "-key-file",
      keyPath,
      config.domain,
    ]);
    return { certPath, keyPath };
  }

  assert(
    hasCommand("openssl"),
    "Neither mkcert nor openssl was found. Install mkcert with: brew install mkcert",
  );

  console.log(
    `Generating self-signed certificate with openssl for ${config.domain}`,
  );
  const opensslConfigPath = path.join(
    config.certDir,
    `${config.domain}.openssl.cnf`,
  );

  await writeFile(opensslConfigPath, opensslConfig(), "utf8");
  run("openssl", [
    "req",
    "-x509",
    "-nodes",
    "-days",
    String(config.certDays),
    "-newkey",
    "rsa:2048",
    "-keyout",
    keyPath,
    "-out",
    certPath,
    "-config",
    opensslConfigPath,
    "-extensions",
    "v3_req",
  ]);

  return { certPath, keyPath };
}

function opensslConfig() {
  return `[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
CN = ${config.domain}

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${config.domain}
`;
}

function run(command, args) {
  execFileSync(command, args, { stdio: "inherit" });
}

function hasCommand(command) {
  try {
    execFileSync("sh", ["-lc", `command -v ${command}`], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function exists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getToken() {
  if (token) return token;

  const response = await api("/tokens", {
    auth: false,
    method: "POST",
    data: {
      identity: config.npmEmail,
      secret: config.npmPassword,
    },
  });

  assert(
    !response.requires2fa,
    "NPM user has 2FA enabled. Use an admin without 2FA for automation.",
  );
  token = response.token;
  return token;
}

async function uploadCertificate(files) {
  const certificate = await findOrCreateCertificate();
  const form = new FormData();

  form.append(
    "certificate",
    new Blob([await readFile(files.certPath)]),
    path.basename(files.certPath),
  );
  form.append(
    "certificate_key",
    new Blob([await readFile(files.keyPath)]),
    path.basename(files.keyPath),
  );

  await api(`/nginx/certificates/${certificate.id}/upload`, {
    method: "POST",
    form,
  });
  console.log(
    `Uploaded certificate files to NPM certificate #${certificate.id}`,
  );

  return certificate.id;
}

async function findCertificate({ provider } = {}) {
  const certificates = await api("/nginx/certificates");
  return certificates.find(
    (item) =>
      (!provider || item.provider === provider) &&
      (item.nice_name === config.domain ||
        item.domain_names?.includes(config.domain)),
  );
}

async function findOrCreateCertificate() {
  const certificate = await findCertificate({ provider: "other" });

  if (certificate) {
    console.log(
      `Using NPM certificate #${certificate.id} for ${config.domain}`,
    );
    return certificate;
  }

  const created = await api("/nginx/certificates", {
    method: "POST",
    data: {
      provider: "other",
      nice_name: config.domain,
    },
  });

  console.log(`Created NPM certificate #${created.id} for ${config.domain}`);
  return created;
}

async function deleteProxyHostAndCertificate() {
  const proxyHosts = await api("/nginx/proxy-hosts");
  const host = proxyHosts.find((item) =>
    item.domain_names?.includes(config.domain),
  );
  let certificateId = host?.certificate_id || 0;

  if (host) {
    await api(`/nginx/proxy-hosts/${host.id}`, { method: "DELETE" });
    console.log(`Deleted NPM Proxy Host #${host.id} for ${config.domain}`);
  } else {
    console.log(`NPM Proxy Host for ${config.domain} was not found`);
  }

  if (!certificateId) {
    const certificate = await findCertificate();
    certificateId = certificate?.id || 0;
  }

  if (certificateId) {
    await api(`/nginx/certificates/${certificateId}`, { method: "DELETE" });
    console.log(
      `Deleted NPM certificate #${certificateId} for ${config.domain}`,
    );
  } else {
    console.log(`NPM certificate for ${config.domain} was not found`);
  }
}

async function updatePublicUrl() {
  const binding = publicTargets[config.target];
  if (!binding) return;

  settings[binding.group] = {
    ...(settings[binding.group] || {}),
    [binding.key]: `${config.ssl ? "https" : config.scheme}://${config.domain}${binding.path || ""}`,
  };
  await writeSettings(settings);
  console.log(
    `Updated settings ${binding.name}: ${settings[binding.group][binding.key]}`,
  );
}

async function resetPublicUrlsForDomain() {
  let changed = false;
  const defaultSettings = await readJson(defaultSettingsFile);

  for (const binding of Object.values(publicTargets)) {
    if (!shouldResetPublicUrl(binding)) continue;

    const defaultUrl = resetUrlForBinding(binding, defaultSettings);
    settings[binding.group] = {
      ...(settings[binding.group] || {}),
      [binding.key]: defaultUrl,
    };
    changed = true;
    console.log(`Reset settings ${binding.name}: ${defaultUrl}`);
  }

  if (changed) await writeSettings(settings);
  await resetProjectPublicUrlsForDomain();
}

function resetUrlForBinding(binding, defaultSettings) {
  if (binding.name === "registry.registryUrl") {
    return `http://localhost:${settings.registry?.registryPort || defaultSettings.registry?.registryPort || "5051"}`;
  }

  if (binding.name === "registry.registryUiUrl") {
    return `http://localhost:${settings.registry?.registryUiPort || defaultSettings.registry?.registryUiPort || "5081"}`;
  }

  return settingsValue(defaultSettings, binding.name);
}

function shouldResetPublicUrl(binding) {
  try {
    return (
      new URL(settings[binding.group]?.[binding.key] || "").hostname ===
      config.domain
    );
  } catch {
    return false;
  }
}

function publicUrl() {
  return `${config.ssl ? "https" : config.scheme}://${config.domain}`;
}

async function updateProjectPublicUrl() {
  const store = await readProjectsStore();
  const project = store.projects.find(
    (item) => item?.web?.proxyTarget === config.target,
  );
  if (!project) return;

  const next = {
    ...project,
    updatedAt: new Date().toISOString(),
    web: {
      ...(project.web || {}),
      url: publicUrl(),
    },
  };

  await persistProjectLink(store, project.name, next);
  console.log(`Updated project ${project.name} URL: ${next.web.url}`);
}

async function resetProjectPublicUrlsForDomain() {
  const store = await readProjectsStore();
  let changed = false;
  const nextProjects = [];

  for (const project of store.projects) {
    if (!projectUrlMatchesDomain(project)) {
      nextProjects.push(project);
      continue;
    }

    const next = {
      ...project,
      updatedAt: new Date().toISOString(),
      web: { ...(project.web || {}) },
    };
    delete next.web.url;
    nextProjects.push(next);
    await writeProjectJson(projectConfigFile(next), next);
    changed = true;
    console.log(`Reset project ${project.name} URL`);
  }

  if (changed) await writeProjectsStore({ projects: nextProjects });
}

async function persistProjectLink(store, name, project) {
  const nextStore = {
    projects: store.projects.map((item) =>
      item.name === name ? project : item,
    ),
  };
  await writeProjectsStore(nextStore);
  await writeProjectJson(projectConfigFile(project), project);
}

function projectUrlMatchesDomain(project) {
  try {
    return new URL(project?.web?.url || "").hostname === config.domain;
  } catch {
    return false;
  }
}

async function upsertProxyHost(certificateId) {
  const proxyHosts = await api("/nginx/proxy-hosts");
  const existing = proxyHosts.find((item) =>
    item.domain_names?.includes(config.domain),
  );
  const payload = proxyPayload(certificateId);

  if (existing) {
    const updated = await api(`/nginx/proxy-hosts/${existing.id}`, {
      method: "PUT",
      data: payload,
    });
    console.log(`Updated NPM Proxy Host #${updated.id}`);
    return updated;
  }

  const created = await api("/nginx/proxy-hosts", {
    method: "POST",
    data: payload,
  });
  console.log(`Created NPM Proxy Host #${created.id}`);
  return created;
}

function proxyPayload(certificateId) {
  return {
    domain_names: [config.domain],
    forward_scheme: config.scheme,
    forward_host: config.target,
    forward_port: config.port,
    access_list_id: 0,
    certificate_id: certificateId,
    ssl_forced: config.ssl,
    caching_enabled: false,
    block_exploits: true,
    advanced_config: "",
    meta: {},
    allow_websocket_upgrade: true,
    http2_support: config.ssl,
    enabled: true,
    locations: [],
    hsts_enabled: false,
    hsts_subdomains: false,
    trust_forwarded_proto: false,
  };
}

async function api(apiPath, { auth = true, method = "GET", data, form } = {}) {
  const headers = {};

  if (auth) headers.Authorization = `Bearer ${await getToken()}`;
  if (data) headers["Content-Type"] = "application/json";

  const response = await fetch(`${config.npmApiUrl}/api${apiPath}`, {
    method,
    headers,
    body: form || (data ? JSON.stringify(data) : undefined),
  });

  const text = await response.text();
  const payload = text ? parseJson(text) : null;

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.message ||
      text ||
      response.statusText;
    throw new Error(
      `NPM API ${method} ${apiPath} failed: ${response.status} ${message}`,
    );
  }

  return payload;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
