import type {
  CommandId,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  PostgresInstanceAction,
  PostgresInstanceForm,
  ProxyFormState,
} from "@/entities/infrastructure";

type StreamHandlers = {
  onOpen?: () => void;
  onPrompt?: (prompt: string) => void;
  onSession?: (sessionId: string) => void;
  onMessage: (text: string) => void;
  onDone: (text: string, ok: boolean) => void;
  onError: (text: string) => void;
};

export function streamCommand(command: CommandId, handlers: StreamHandlers): () => void {
  const url = streamUrl("/api/stream/run", { command });
  return openStream(url, handlers);
}

export function streamHost(action: "add" | "remove", domain: string, handlers: StreamHandlers): () => void {
  const url = streamUrl("/api/stream/host", { action, domain });
  return openStream(url, handlers);
}

export function streamProxy(form: ProxyFormState, handlers: StreamHandlers): () => void {
  const url = streamUrl("/api/stream/proxy", {
    domain: form.domain,
    target: form.target,
    port: form.port,
    ssl: form.ssl,
  });

  return openStream(url, handlers);
}

export function streamProxyDelete(domain: string, handlers: StreamHandlers): () => void {
  const url = streamUrl("/api/stream/proxy-delete", { domain });
  return openStream(url, handlers);
}

export function streamShell(container: string, handlers: StreamHandlers): () => void {
  const url = streamUrl("/api/stream/shell", { container });
  return openStream(url, handlers);
}

export function streamMariaDbInstanceCreate(form: MariaDbInstanceForm, handlers: StreamHandlers): () => void {
  const url = streamUrl("/api/stream/mariadb-instance-add", {
    authMode: form.authMode,
    password: form.password,
    port: form.port,
    rootPassword: form.rootPassword,
    user: form.user,
    version: form.version,
  });

  return openStream(url, handlers);
}

export function streamMariaDbInstanceAction(
  name: string,
  action: MariaDbInstanceAction,
  handlers: StreamHandlers,
): () => void {
  const url = streamUrl("/api/stream/mariadb-instance", { action, name });
  return openStream(url, handlers);
}

export function streamPostgresInstanceCreate(form: PostgresInstanceForm, handlers: StreamHandlers): () => void {
  const url = streamUrl("/api/stream/postgres-instance-add", {
    database: form.database,
    password: form.password,
    user: form.user,
    version: form.version,
  });

  return openStream(url, handlers);
}

export function streamPostgresInstanceAction(
  name: string,
  action: PostgresInstanceAction,
  handlers: StreamHandlers,
): () => void {
  const url = streamUrl("/api/stream/postgres-instance", { action, name });
  return openStream(url, handlers);
}

export async function sendShellInput(sessionId: string, input: string): Promise<void> {
  await sendShellRequest("/api/stream/shell/input", { sessionId, input });
}

export async function stopShellSession(sessionId: string): Promise<void> {
  await sendShellRequest("/api/stream/shell/stop", { sessionId });
}

function openStream(url: URL, handlers: StreamHandlers): () => void {
  const source = new EventSource(url);

  handlers.onOpen?.();
  source.onmessage = (event) => handlers.onMessage(event.data);
  source.addEventListener("session", (event) => {
    handlers.onSession?.(event.data);
  });
  source.addEventListener("prompt", (event) => {
    handlers.onPrompt?.(event.data);
  });
  source.addEventListener("done", (event) => {
    const text = event.data;
    source.close();
    handlers.onDone(text, text.includes("[exit 0]"));
  });

  source.onerror = () => {
    source.close();
    handlers.onError("Stream connection closed");
  };

  return () => source.close();
}

function streamUrl(path: string, params: Record<string, boolean | number | string | undefined>): URL {
  const url = new URL(path, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== false && value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value === true ? "1" : String(value));
    }
  });

  return url;
}

async function sendShellRequest(path: string, payload: Record<string, string>): Promise<void> {
  const response = await fetch(path, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) throw new Error(await response.text());
}
