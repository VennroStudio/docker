import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchContainerStates, type ContainerStateInfo } from "../api/containers";

type UseContainerStatesOptions = {
  enabled: boolean;
  names: string[];
};

export function useContainerStates({ enabled, names }: UseContainerStatesOptions) {
  const [states, setStates] = useState<Record<string, ContainerStateInfo>>({});
  const [error, setError] = useState<string | null>(null);
  const key = useMemo(() => [...new Set(names)].sort().join(","), [names]);

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled || !key) {
        setStates({});
        setError(null);
        return;
      }

      try {
        setStates(await fetchContainerStates(key.split(","), signal));
        setError(null);
      } catch (requestError) {
        if (signal?.aborted) return;
        setError(requestError instanceof Error ? requestError.message : String(requestError));
      }
    },
    [enabled, key],
  );

  useEffect(() => {
    const controller = new AbortController();
    const initialTimer = window.setTimeout(() => {
      void refresh(controller.signal);
    }, 0);

    if (!enabled || !key) {
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
  }, [enabled, key, refresh]);

  return { error, refresh, states };
}
