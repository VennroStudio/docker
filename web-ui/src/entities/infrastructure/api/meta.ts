export type AppMeta = {
  projectName: string;
  projectRoot: string;
};

export async function fetchAppMeta(signal?: AbortSignal): Promise<AppMeta> {
  const response = await fetch("/api/meta", { signal });

  if (!response.ok) {
    throw new Error(`Meta request failed: ${response.status}`);
  }

  return (await response.json()) as AppMeta;
}
