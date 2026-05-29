export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  errorPrefix = "Request failed",
): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `${errorPrefix}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function jsonRequestInit(method: "POST" | "PUT", body?: unknown): RequestInit {
  return {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method,
  };
}
