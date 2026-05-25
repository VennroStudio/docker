import type { ServiceViewId } from "@/entities/infrastructure";

export type HomeService = {
  id: ServiceViewId;
};

export const homeServices: HomeService[] = [
  { id: "proxy" },
  { id: "mariadb" },
  { id: "redis" },
  { id: "minio" },
  { id: "registry" },
];
