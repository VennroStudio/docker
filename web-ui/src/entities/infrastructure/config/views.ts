import { Box, Database, HardDrive, House, Package, Route, Server, Shield } from "lucide-react";
import type { ViewConfig } from "../model/types";

const routeViews: ViewConfig[] = [
  {
    id: "home",
    label: "Home",
    path: "/",
    shortLabel: "HM",
    subtitle: "Overview",
    icon: House,
  },
  {
    id: "proxy",
    label: "NPM",
    path: "/proxy",
    shortLabel: "NP",
    subtitle: "Proxy + network",
    icon: Shield,
  },
  {
    id: "network",
    label: "Network",
    path: "/network",
    shortLabel: "NW",
    subtitle: "Docker proxy",
    icon: Route,
  },
  {
    id: "nginx",
    label: "Nginx",
    path: "/nginx",
    shortLabel: "NX",
    subtitle: "Proxy logs",
    icon: Shield,
  },
  {
    id: "mariadb",
    label: "Databases",
    path: "/databases",
    shortLabel: "DB",
    subtitle: "SQL stack",
    icon: Database,
  },
  {
    id: "postgres",
    label: "Postgres",
    path: "/postgres",
    shortLabel: "PG",
    subtitle: "Database",
    icon: Server,
  },
  {
    id: "redis",
    label: "Redis",
    path: "/redis",
    shortLabel: "RD",
    subtitle: "Cache",
    icon: Box,
  },
  {
    id: "minio",
    label: "MinIO",
    path: "/minio",
    shortLabel: "S3",
    subtitle: "Storage",
    icon: HardDrive,
  },
  {
    id: "registry",
    label: "Registry",
    path: "/registry",
    shortLabel: "RG",
    subtitle: "Docker images",
    icon: Package,
  },
];

export const views = routeViews.filter((view) => !["network", "nginx", "postgres"].includes(view.id));

export function getViewById(viewId: string): ViewConfig {
  return routeViews.find((view) => view.id === viewId) ?? routeViews[0];
}

export function getViewByPath(pathname: string): ViewConfig {
  if (pathname === "/nginx" || pathname === "/network") return getViewById("proxy");
  if (pathname === "/mariadb" || pathname === "/postgres") return getViewById("mariadb");
  return routeViews.find((view) => view.path === pathname) ?? routeViews[0];
}
