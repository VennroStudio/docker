import type { AppSettings, GenerateEnvResponse, SettingsResponse } from "../model/types";

export async function fetchSettings(signal?: AbortSignal): Promise<SettingsResponse> {
  const response = await fetch("/api/settings", { signal });

  if (!response.ok) {
    throw new Error(`Settings request failed: ${response.status}`);
  }

  return (await response.json()) as SettingsResponse;
}

export async function saveSettings(settings: AppSettings): Promise<SettingsResponse> {
  const response = await fetch("/api/settings", {
    body: JSON.stringify(settings),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error((await response.text()) || `Settings save failed: ${response.status}`);
  }

  return (await response.json()) as SettingsResponse;
}

export async function generateEnvFromSettings(): Promise<GenerateEnvResponse> {
  const response = await fetch("/api/settings/env", { method: "POST" });

  if (!response.ok) {
    throw new Error((await response.text()) || `Env generation failed: ${response.status}`);
  }

  return (await response.json()) as GenerateEnvResponse;
}
