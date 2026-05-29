import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchArchives } from "../api/archives";

type ArchiveFile = Awaited<ReturnType<typeof fetchArchives>>["archives"][number];

export function useArchives(enabled: boolean, refreshSignal = 0) {
  const [archives, setArchives] = useState<ArchiveFile[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchArchives(signal);
      setArchives(response.archives);
    } catch (nextError) {
      if (!signal?.aborted) {
        setArchives([]);
        setError(nextError instanceof Error ? nextError.message : String(nextError));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setArchives([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [enabled, refresh, refreshSignal]);

  return useMemo(() => ({ archives, error, loading, refresh }), [archives, error, loading, refresh]);
}
