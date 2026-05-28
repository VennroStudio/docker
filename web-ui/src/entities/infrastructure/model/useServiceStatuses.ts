import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchServiceStatuses } from "../api/status";
import type { ServiceStatus, ServiceViewId } from "./types";

type ServiceStatusMap = Partial<Record<ServiceViewId, ServiceStatus>>;

type UseServiceStatusesOptions = {
  enabled: boolean;
};

export function useServiceStatuses({ enabled }: UseServiceStatusesOptions) {
  const [statuses, setStatuses] = useState<ServiceStatusMap>({});

  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (!enabled) {
        setStatuses({});
        return;
      }

      const nextStatuses = await fetchServiceStatuses(signal);
      setStatuses(Object.fromEntries(nextStatuses.map((status) => [status.id, status])) as ServiceStatusMap);
    },
    [enabled],
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    const initialTimer = window.setTimeout(() => {
      refresh(controller.signal).catch(() => setStatuses({}));
    }, 0);

    const timer = window.setInterval(() => {
      refresh().catch(() => setStatuses({}));
    }, 5000);

    return () => {
      controller.abort();
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [enabled, refresh]);

  return useMemo(() => ({ refresh, statuses }), [refresh, statuses]);
}
