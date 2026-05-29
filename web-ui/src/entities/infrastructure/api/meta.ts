import { fetchJson } from "@/shared/api";

export type AppMeta = {
  projectName: string;
  projectRoot: string;
};

export async function fetchAppMeta(signal?: AbortSignal): Promise<AppMeta> {
  return fetchJson<AppMeta>("/api/meta", { signal }, "Meta request failed");
}
