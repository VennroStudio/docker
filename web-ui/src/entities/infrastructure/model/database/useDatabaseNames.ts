import { useCallback, useEffect, useState } from "react";
import type { FetchDatabases } from "./formTypes";
import { toErrorMessage } from "./formUtils";

type UseDatabaseNamesOptions = {
  container: string;
  enabled: boolean;
  fetchDatabases: FetchDatabases;
  refreshSignal?: number;
  onLoaded?: (names: string[]) => void;
};

export function useDatabaseNames({
  container,
  enabled,
  fetchDatabases,
  onLoaded,
  refreshSignal = 0,
}: UseDatabaseNamesOptions) {
  const [databases, setDatabases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setDatabases([]);
        setError(null);
        return [];
      }

      setLoading(true);
      setError(null);
      setDatabases([]);

      try {
        const names = await fetchDatabases(container);
        if (signal?.aborted) return [];

        setDatabases(names);
        onLoaded?.(names);
        return names;
      } catch (requestError) {
        if (signal?.aborted) return [];

        setError(toErrorMessage(requestError));
        setDatabases([]);
        return [];
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [container, enabled, fetchDatabases, onLoaded],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => load(controller.signal));

    return () => {
      controller.abort();
    };
  }, [load, refreshSignal]);

  return { databases, error, loading, refresh: load };
}
