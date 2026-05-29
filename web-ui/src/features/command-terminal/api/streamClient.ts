export type StreamHandlers = {
  onOpen?: () => void;
  onPrompt?: (prompt: string) => void;
  onSession?: (sessionId: string) => void;
  onMessage: (text: string) => void;
  onDone: (text: string, ok: boolean) => void;
  onError: (text: string) => void;
};

type StreamPayload = Record<string, boolean | number | string | undefined>;

export function openStream(url: URL, handlers: StreamHandlers): () => void {
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

export function openPostStream(path: string, payload: StreamPayload, handlers: StreamHandlers): () => void {
  const abortController = new AbortController();

  void readPostStream(path, payload, handlers, abortController).catch((error: unknown) => {
    if (!abortController.signal.aborted) {
      handlers.onError(error instanceof Error ? error.message : String(error));
    }
  });

  return () => abortController.abort();
}

export function streamUrl(path: string, params: StreamPayload): URL {
  const url = new URL(path, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== false && value !== "" && value !== null && value !== undefined) {
      url.searchParams.set(key, value === true ? "1" : String(value));
    }
  });

  return url;
}

export async function sendJsonRequest(path: string, payload: Record<string, string>): Promise<void> {
  const response = await fetch(path, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) throw new Error(await response.text());
}

async function readPostStream(
  path: string,
  payload: StreamPayload,
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

function dropEmptyValues(payload: StreamPayload) {
  return Object.fromEntries(
    Object.entries(payload).filter(
      ([, value]) => value !== false && value !== "" && value !== null && value !== undefined,
    ),
  );
}
