import { useCallback, useEffect, useState } from "react";
import { getPostgresOverview } from "../api/postgres";
import type { PgAdminOverview, PostgresInstance } from "@/entities/infrastructure";

const fallbackPgAdmin: PgAdminOverview = {
  container: "pgadmin-container",
  state: "unknown",
};

export function usePostgresInstances(enabled: boolean) {
  const [error, setError] = useState<string | null>(null);
  const [instances, setInstances] = useState<PostgresInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [pgadmin, setPgAdmin] = useState<PgAdminOverview>(fallbackPgAdmin);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const overview = await getPostgresOverview();
      setInstances(overview.instances);
      setPgAdmin(overview.pgadmin);
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

  return { error, instances, loading, pgadmin, refresh };
}
