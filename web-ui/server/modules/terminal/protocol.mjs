export function parseTerminalMessage(payload) {
  try {
    return JSON.parse(payload.toString("utf8"));
  } catch {
    return null;
  }
}

export function sendTerminalMessage(ws, payload) {
  if (ws.readyState === 1) ws.send(JSON.stringify(payload));
}

export function validateDimension(value, fallback) {
  const dimension = Number(value);
  if (!Number.isInteger(dimension) || dimension < 1 || dimension > 1000) {
    return fallback;
  }

  return dimension;
}
