import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchServiceLinks, type ServiceLink } from "../../../shared/api/links";

export function useServiceLinks() {
  const [links, setLinks] = useState<Record<string, ServiceLink>>({});

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const response = await fetchServiceLinks(signal);
    setLinks(response.links);
  }, []);

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
