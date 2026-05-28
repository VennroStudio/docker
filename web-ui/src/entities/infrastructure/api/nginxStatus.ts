import type { ContainerRuntimeState } from "../model/types";

export type NginxStatus = {
  container: string;
  running: boolean;
  state: ContainerRuntimeState;
  uptime: string;
  url: string;
};

export async function fetchNginxStatus(signal?: AbortSignal): Promise<NginxStatus> {
  const response = await fetch("/api/nginx/status", { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as NginxStatus;
}
