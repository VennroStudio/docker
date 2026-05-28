import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchServiceLinks, type ServiceLink } from "../api/links";

export function useServiceLinks(enabled = true) {
  const [links, setLinks] = useState<Record<string, ServiceLink>>({});

  const refresh = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) {
      setLinks({});
      return;
    }

    const response = await fetchServiceLinks(signal);
    setLinks(response.links);
  }, [enabled]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void refresh(controller.signal).catch(() => setLinks({}));
    }, 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [refresh]);

  return useMemo(() => ({ links, refresh }), [links, refresh]);
}
