import { useCallback, useEffect, useState } from "react";
import { getMariaDbOverview } from "../api/mariadb";
import type { MariaDbInstance, PhpMyAdminOverview } from "@/entities/infrastructure";

const fallbackPhpMyAdmin: PhpMyAdminOverview = {
  container: "phpmyadmin-container",
  state: "unknown",
};

export function useMariaDbInstances(enabled: boolean) {
  const [error, setError] = useState<string | null>(null);
  const [instances, setInstances] = useState<MariaDbInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [phpmyadmin, setPhpMyAdmin] = useState<PhpMyAdminOverview>(fallbackPhpMyAdmin);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const overview = await getMariaDbOverview();
      setInstances(overview.instances);
      setPhpMyAdmin(overview.phpmyadmin);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  return { error, instances, loading, phpmyadmin, refresh };
}
