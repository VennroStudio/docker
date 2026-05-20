import type { ServiceViewId } from "../../../shared/types/commands";

export type HomeService = {
  id: ServiceViewId;
};

export const homeServices: HomeService[] = [
  { id: "proxy" },
  { id: "mariadb" },
  { id: "postgres" },
  { id: "redis" },
  { id: "minio" },
  { id: "registry" },
];
