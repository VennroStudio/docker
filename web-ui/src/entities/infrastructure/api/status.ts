import type { ServiceStatus } from "../model/types";

type StatusResponse = {
  services: ServiceStatus[];
};

export async function fetchServiceStatuses(signal?: AbortSignal): Promise<ServiceStatus[]> {
  const response = await fetch("/api/status", { signal });

  if (!response.ok) {
    throw new Error(`Status request failed: ${response.status}`);
  }

  const payload = (await response.json()) as StatusResponse;
  return payload.services;
}
