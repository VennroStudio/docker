export async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

export function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

export function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateDomain(value) {
  assert(/^[a-zA-Z0-9.-]+$/.test(value || ""), "Invalid DOMAIN");
}

export function validateTarget(value) {
  assert(/^[a-zA-Z0-9._-]+$/.test(value || ""), "Invalid TARGET");
}

export function validatePort(value) {
  const portNumber = Number(value);
  assert(Number.isInteger(portNumber) && portNumber > 0 && portNumber <= 65535, "Invalid PORT");
}
