import { getPostgresOverview } from "../api/postgres";
import { useDatabaseOverview, type PgAdminOverview, type PostgresInstance } from "@/entities/infrastructure";
import type { PostgresOverview } from "../api/postgres";

const fallbackPgAdmin: PgAdminOverview = {
  container: "pgadmin-container",
  state: "unknown",
};

export function usePostgresInstances(enabled: boolean) {
  const overview = useDatabaseOverview({
    enabled,
    fallbackAdmin: fallbackPgAdmin,
    fetchOverview: getPostgresOverview,
    selectAdmin: selectPgAdmin,
    selectInstances,
  });

  const { admin, ...state } = overview;
  return { ...state, pgadmin: admin };
}

function selectInstances(overview: PostgresOverview): PostgresInstance[] {
  return overview.instances;
}

function selectPgAdmin(overview: PostgresOverview): PgAdminOverview {
  return overview.pgadmin;
}
