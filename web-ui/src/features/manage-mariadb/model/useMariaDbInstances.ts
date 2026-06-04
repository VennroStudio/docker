import { getMariaDbOverview } from "../api/mariadb";
import { useDatabaseOverview, type MariaDbInstance, type PhpMyAdminOverview } from "@/entities/infrastructure";
import type { MariaDbOverview } from "../api/mariadb";

const fallbackPhpMyAdmin: PhpMyAdminOverview = {
  container: "phpmyadmin-container",
  state: "unknown",
};

export function useMariaDbInstances(enabled: boolean) {
  const overview = useDatabaseOverview({
    enabled,
    fallbackAdmin: fallbackPhpMyAdmin,
    fetchOverview: getMariaDbOverview,
    selectAdmin: selectPhpMyAdmin,
    selectInstances,
  });

  const { admin, ...state } = overview;
  return { ...state, phpmyadmin: admin };
}

function selectInstances(overview: MariaDbOverview): MariaDbInstance[] {
  return overview.instances;
}

function selectPhpMyAdmin(overview: MariaDbOverview): PhpMyAdminOverview {
  return overview.phpmyadmin;
}
