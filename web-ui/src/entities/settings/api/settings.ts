import { fetchJson, jsonRequestInit } from "@/shared/api";
import type { AppSettings, GenerateEnvResponse, SettingsResponse } from "../model/types";

export async function fetchSettings(signal?: AbortSignal): Promise<SettingsResponse> {
  return fetchJson<SettingsResponse>("/api/settings", { signal }, "Settings request failed");
}

export async function saveSettings(settings: AppSettings): Promise<SettingsResponse> {
  return fetchJson<SettingsResponse>("/api/settings", jsonRequestInit("PUT", settings), "Settings save failed");
}

export async function generateEnvFromSettings(): Promise<GenerateEnvResponse> {
  return fetchJson<GenerateEnvResponse>("/api/settings/env", { method: "POST" }, "Env generation failed");
}
