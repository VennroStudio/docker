import { fetchJson } from "@/shared/api";
import type { ContainerRuntimeState } from "../model/types";

export type RustfsStatusResponse = {
  container: string;
  running: boolean;
  state: ContainerRuntimeState;
  status: string;
  uptime: string;
  url?: string;
};

export async function fetchRustfsStatus(signal?: AbortSignal) {
  return fetchJson<RustfsStatusResponse>("/api/rustfs/status", { signal }, "RustFS status request failed");
}
