import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchSettings, generateEnvFromSettings, saveSettings } from "../api/settings";
import type { AppSettings, SettingsResponse } from "./types";

export function useSettings() {
  const [response, setResponse] = useState<SettingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingEnv, setGeneratingEnv] = useState(false);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);

    try {
      setResponse(await fetchSettings(signal));
    } catch (requestError) {
      if (!signal?.aborted) setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const save = useCallback(async (settings: AppSettings) => {
    setSaving(true);
    setError(null);

    try {
      const nextResponse = await saveSettings(settings);
      setResponse(nextResponse);
      return nextResponse;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : String(requestError);
      setError(message);
      throw requestError;
    } finally {
      setSaving(false);
    }
  }, []);

  const generateEnv = useCallback(async () => {
    setGeneratingEnv(true);
    setError(null);

    try {
      return await generateEnvFromSettings();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : String(requestError);
      setError(message);
      throw requestError;
    } finally {
      setGeneratingEnv(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void refresh(controller.signal);
    }, 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [refresh]);

  return useMemo(
    () => ({
      error,
      exists: response?.exists ?? false,
      generateEnv,
      generatingEnv,
      loading,
      path: response?.path ?? "",
      refresh,
      save,
      saving,
      settings: response?.settings ?? null,
    }),
    [error, generateEnv, generatingEnv, loading, refresh, response, save, saving],
  );
}
