import { useCallback, useEffect, useState } from "react";
import { fetchNginxStatus, type NginxStatus } from "../api/nginxStatus";

export function useNginxStatus(enabled: boolean) {
  const [status, setStatus] = useState<NginxStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setStatus(null);
        setError(null);
        return;
      }

      try {
        setStatus(await fetchNginxStatus(signal));
        setError(null);
      } catch (requestError) {
        if (signal?.aborted) return;
        setError(requestError instanceof Error ? requestError.message : String(requestError));
      }
    },
    [enabled],
  );

  useEffect(() => {
    const controller = new AbortController();
    const initialTimer = window.setTimeout(() => {
      void refresh(controller.signal);
    }, 0);

    if (!enabled) {
      return () => {
        controller.abort();
        window.clearTimeout(initialTimer);
      };
    }

    const interval = window.setInterval(() => void refresh(controller.signal), 5000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initialTimer);
      controller.abort();
    };
  }, [enabled, refresh]);

  return { error, refresh, status };
}
