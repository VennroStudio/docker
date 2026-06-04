import { useCallback, useEffect, useState } from "react";
import { toErrorMessage } from "./formUtils";

type UseDatabaseOverviewOptions<Overview, Instance, Admin> = {
  enabled: boolean;
  fallbackAdmin: Admin;
  fetchOverview: () => Promise<Overview>;
  selectAdmin: (overview: Overview) => Admin;
  selectInstances: (overview: Overview) => Instance[];
};

export function useDatabaseOverview<Overview, Instance, Admin>({
  enabled,
  fallbackAdmin,
  fetchOverview,
  selectAdmin,
  selectInstances,
}: UseDatabaseOverviewOptions<Overview, Instance, Admin>) {
  const [admin, setAdmin] = useState<Admin>(fallbackAdmin);
  const [error, setError] = useState<string | null>(null);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const overview = await fetchOverview();
      setInstances(selectInstances(overview));
      setAdmin(selectAdmin(overview));
    } catch (caught) {
      setError(toErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchOverview, selectAdmin, selectInstances]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  return { admin, error, instances, loading, refresh };
}
