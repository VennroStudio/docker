#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

process.on("uncaughtException", fail);
process.on("unhandledRejection", fail);

const args = parseArgs(process.argv.slice(2));
const config = {
  domain: need(args.domain || process.env.DOMAIN, "DOMAIN"),
  target: need(args.target || process.env.TARGET, "TARGET"),
  port: Number(need(args.port || process.env.PORT, "PORT")),
  scheme: args.scheme || process.env.SCHEME || "http",
  ssl: bool(args.ssl ?? process.env.SSL),
  npmUrl: trimSlash(need(process.env.NPM_URL, "NPM_URL")),
  npmEmail: need(process.env.NPM_EMAIL, "NPM_EMAIL"),
  npmPassword: need(process.env.NPM_PASSWORD, "NPM_PASSWORD"),
  certDir: process.env.CERT_DIR || "certs",
  certDays: Number(process.env.CERT_DAYS || "825"),
  forceCert: bool(args["force-cert"] ?? process.env.FORCE_CERT),
};

validate(config);
await main();

async function main() {
  await getToken();

  const certificateId = config.ssl
    ? await uploadCertificate(await ensureCertificateFiles())
    : 0;

  const host = await upsertProxyHost(certificateId);
  console.log(`Proxy Host #${host.id}: ${config.domain} -> ${config.target}:${config.port}`);
  console.log(`Open: ${config.ssl ? "https" : "http"}://${config.domain}`);
}

function parseArgs(values) {
  const result = {};

  for (let i = 0; i < values.length; i += 1) {
    if (!values[i].startsWith("--")) continue;

    const key = values[i].slice(2);
    const value = values[i + 1];
    result[key] = value === undefined || value.startsWith("--") ? "1" : value;
    if (result[key] === value) i += 1;
  }

  return result;
}

function validate({ domain, target, port }) {
  assert(/^[a-zA-Z0-9.-]+$/.test(domain), `Invalid DOMAIN: ${domain}`);
  assert(/^[a-zA-Z0-9._-]+$/.test(target), `Invalid TARGET: ${target}`);
  assert(Number.isInteger(port) && port > 0 && port <= 65535, `Invalid PORT: ${port}`);
}

function need(value, name) {
  if (!value) {
    throw new Error(`Missing ${name}. Example: make app-proxy DOMAIN=pma.local TARGET=phpmyadmin-container PORT=80`);
  }

  return value;
}

function bool(value) {
  return ["1", "true", "yes", "on"].includes(String(value || "").toLowerCase());
}

function trimSlash(value) {
  return value.replace(/\/+$/, "");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fail(error) {
  console.error(error.message || String(error));
  process.exit(1);
}

async function ensureCertificateFiles() {
  await mkdir(config.certDir, { recursive: true });

  const certPath = path.join(config.certDir, `${config.domain}.crt`);
  const keyPath = path.join(config.certDir, `${config.domain}.key`);

  if (!config.forceCert && await exists(certPath) && await exists(keyPath)) {
    console.log(`Using existing certificate: ${certPath}`);
    return { certPath, keyPath };
  }

  if (hasCommand("mkcert")) {
    console.log(`Generating trusted local certificate with mkcert for ${config.domain}`);
    run("mkcert", ["-install"]);
    run("mkcert", ["-cert-file", certPath, "-key-file", keyPath, config.domain]);
    return { certPath, keyPath };
  }

  assert(hasCommand("openssl"), "Neither mkcert nor openssl was found. Install mkcert with: brew install mkcert");

  console.log(`Generating self-signed certificate with openssl for ${config.domain}`);
  const opensslConfigPath = path.join(config.certDir, `${config.domain}.openssl.cnf`);

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

let token;

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

  assert(!response.requires2fa, "NPM user has 2FA enabled. Use an admin without 2FA for automation.");
  token = response.token;
  return token;
}

async function uploadCertificate(files) {
  const certificate = await findOrCreateCertificate();
  const form = new FormData();

  form.append("certificate", new Blob([await readFile(files.certPath)]), path.basename(files.certPath));
  form.append("certificate_key", new Blob([await readFile(files.keyPath)]), path.basename(files.keyPath));

  await api(`/nginx/certificates/${certificate.id}/upload`, { method: "POST", form });
  console.log(`Uploaded certificate files to NPM certificate #${certificate.id}`);

  return certificate.id;
}

async function findOrCreateCertificate() {
  const certificates = await api("/nginx/certificates");
  const certificate = certificates.find((item) => (
    item.provider === "other"
    && (item.nice_name === config.domain || item.domain_names?.includes(config.domain))
  ));

  if (certificate) {
    console.log(`Using NPM certificate #${certificate.id} for ${config.domain}`);
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

async function upsertProxyHost(certificateId) {
  const proxyHosts = await api("/nginx/proxy-hosts");
  const existing = proxyHosts.find((item) => item.domain_names?.includes(config.domain));
  const payload = proxyPayload(certificateId);

  if (existing) {
    const updated = await api(`/nginx/proxy-hosts/${existing.id}`, { method: "PUT", data: payload });
    console.log(`Updated NPM Proxy Host #${updated.id}`);
    return updated;
  }

  const created = await api("/nginx/proxy-hosts", { method: "POST", data: payload });
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

  const response = await fetch(`${config.npmUrl}/api${apiPath}`, {
    method,
    headers,
    body: form || (data ? JSON.stringify(data) : undefined),
  });

  const text = await response.text();
  const payload = text ? parseJson(text) : null;

  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || text || response.statusText;
    throw new Error(`NPM API ${method} ${apiPath} failed: ${response.status} ${message}`);
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
