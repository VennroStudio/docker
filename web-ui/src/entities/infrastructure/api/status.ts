import { fetchJson } from "@/shared/api";
import type { ServiceStatus } from "../model/types";

type StatusResponse = {
  services: ServiceStatus[];
};

export async function fetchServiceStatuses(signal?: AbortSignal): Promise<ServiceStatus[]> {
  const payload = await fetchJson<StatusResponse>("/api/status", { signal }, "Status request failed");
  return payload.services;
}
