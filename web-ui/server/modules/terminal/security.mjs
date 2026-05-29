const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export function isAllowedTerminalUpgrade(req) {
  const origin = req.headers.origin;
  if (!origin) return true;

  const requestHost = parseHost(req.headers.host);
  if (!requestHost) return false;

  try {
    const originUrl = new URL(origin);
    const originHost = normalizeHost(originUrl.hostname);
    const originPort = originUrl.port || defaultPort(originUrl.protocol);

    if (!originPort || originPort !== requestHost.port) return false;
    if (originHost === requestHost.hostname) return true;

    return loopbackHosts.has(originHost) && loopbackHosts.has(requestHost.hostname);
  } catch {
    return false;
  }
}

export function rejectTerminalUpgrade(socket) {
  socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
  socket.destroy();
}

function parseHost(value) {
  if (!value) return null;

  try {
    const url = new URL(`http://${value}`);
    return {
      hostname: normalizeHost(url.hostname),
      port: url.port || "80",
    };
  } catch {
    return null;
  }
}

function normalizeHost(value) {
  return value.replace(/^\[|\]$/g, "").toLowerCase();
}

function defaultPort(protocol) {
  if (protocol === "http:") return "80";
  if (protocol === "https:") return "443";
  return "";
}
