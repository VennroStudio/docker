import type {
  CommandId,
  MariaDbExportForm,
  MariaDbImportForm,
  MariaDbInstanceAction,
  MariaDbInstanceForm,
  PostgresInstanceAction,
  PostgresExportForm,
  PostgresImportForm,
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
    port: form.port,
    ssl: form.ssl,
    target: form.target,
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
  return openPostStream(
    "/api/stream/mariadb-instance-add",
    {
      authMode: form.authMode,
      password: form.password,
      port: form.port,
      rootPassword: form.rootPassword,
      user: form.user,
      version: form.version,
    },
    handlers,
  );
}

export function streamMariaDbInstanceAction(
  name: string,
  action: MariaDbInstanceAction,
  handlers: StreamHandlers,
): () => void {
  const url = streamUrl("/api/stream/mariadb-instance", { action, name });
  return openStream(url, handlers);
}

export function streamMariaDbImport(form: MariaDbImportForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/mariadb-import",
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
    },
    handlers,
  );
}

export function streamMariaDbExport(form: MariaDbExportForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/mariadb-export",
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
    },
    handlers,
  );
}

export function streamPostgresInstanceCreate(form: PostgresInstanceForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/postgres-instance-add",
    {
      database: form.database,
      password: form.password,
      user: form.user,
      version: form.version,
    },
    handlers,
  );
}

export function streamPostgresInstanceAction(
  name: string,
  action: PostgresInstanceAction,
  handlers: StreamHandlers,
): () => void {
  const url = streamUrl("/api/stream/postgres-instance", { action, name });
  return openStream(url, handlers);
}

export function streamPostgresImport(form: PostgresImportForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/postgres-import",
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
    },
    handlers,
  );
}

export function streamPostgresExport(form: PostgresExportForm, handlers: StreamHandlers): () => void {
  return openPostStream(
    "/api/stream/postgres-export",
    {
      container: form.container,
      database: form.database,
      filePath: form.filePath,
    },
    handlers,
  );
}

export async function sendShellInput(sessionId: string, input: string): Promise<void> {
  await sendShellRequest("/api/stream/shell/input", { input, sessionId });
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

function openPostStream(
  path: string,
  payload: Record<string, boolean | number | string | undefined>,
  handlers: StreamHandlers,
): () => void {
  const abortController = new AbortController();

  void readPostStream(path, payload, handlers, abortController).catch((error: unknown) => {
    if (!abortController.signal.aborted) {
      handlers.onError(error instanceof Error ? error.message : String(error));
    }
  });

  return () => abortController.abort();
}

async function readPostStream(
  path: string,
  payload: Record<string, boolean | number | string | undefined>,
  handlers: StreamHandlers,
  abortController: AbortController,
) {
  const response = await fetch(path, {
    body: JSON.stringify(dropEmptyValues(payload)),
    headers: { "Content-Type": "application/json" },
    method: "POST",
    signal: abortController.signal,
  });

  if (!response.ok || !response.body) {
    throw new Error((await response.text()) || "Stream connection closed");
  }

  handlers.onOpen?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!abortController.signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    buffer = readSseBuffer(buffer, handlers);
  }

  buffer += decoder.decode();
  readSseBuffer(buffer, handlers);
}

function readSseBuffer(buffer: string, handlers: StreamHandlers) {
  let nextBuffer = buffer;
  let blockEnd = nextBuffer.indexOf("\n\n");

  while (blockEnd >= 0) {
    const block = nextBuffer.slice(0, blockEnd);
    nextBuffer = nextBuffer.slice(blockEnd + 2);
    dispatchSseBlock(block, handlers);
    blockEnd = nextBuffer.indexOf("\n\n");
  }

  return nextBuffer;
}

function dispatchSseBlock(block: string, handlers: StreamHandlers) {
  let event = "message";
  const data: string[] = [];

  block.split("\n").forEach((line) => {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
  });

  const text = data.join("\n");

  if (event === "done") handlers.onDone(text, text.includes("[exit 0]"));
  else if (event === "prompt") handlers.onPrompt?.(text);
  else if (event === "session") handlers.onSession?.(text);
  else handlers.onMessage(text);
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

function dropEmptyValues(payload: Record<string, boolean | number | string | undefined>) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== false && value !== "" && value !== null && value !== undefined,
    ),
  );
}

async function sendShellRequest(path: string, payload: Record<string, string>): Promise<void> {
  const response = await fetch(path, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) throw new Error(await response.text());
}
