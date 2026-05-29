import { fetchJson } from "@/shared/api";
import type { ContainerRuntimeState } from "../model/types";

export type NginxStatus = {
  container: string;
  running: boolean;
  state: ContainerRuntimeState;
  uptime: string;
  url: string;
};

export async function fetchNginxStatus(signal?: AbortSignal): Promise<NginxStatus> {
  return fetchJson<NginxStatus>("/api/nginx/status", { signal }, "Nginx status request failed");
}
