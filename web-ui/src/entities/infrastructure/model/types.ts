import type { LucideIcon } from "lucide-react";
import commandManifest from "../../../../commands.manifest.json";

export type ViewId = "home" | "proxy" | "network" | "nginx" | "mariadb" | "postgres" | "redis" | "minio" | "registry";
export type ServiceViewId = Exclude<ViewId, "home" | "network">;
export type CommandId = keyof typeof commandManifest.commands;
export type CommandGroupId = keyof typeof commandManifest.groups;

export type CommandTone = "default" | "primary" | "danger";

export type CommandAction = {
  id: CommandId;
  label: string;
  detail: string;
  tone?: CommandTone;
  confirm?: boolean;
};

export type ShellAction = {
  container: string;
  detail: string;
  label: string;
};

export type ViewConfig = {
  id: ViewId;
  label: string;
  path: string;
  shortLabel: string;
  subtitle: string;
  icon: LucideIcon;
};

export type ProxyFormState = {
  domain: string;
  target: string;
  port: string;
  ssl: boolean;
};

export type MariaDbAuthMode = "config" | "cookie";
export type MariaDbInstanceAction = "clean" | "down" | "logs" | "start" | "stop" | "up";
export type PostgresInstanceAction = MariaDbInstanceAction;
export type ContainerRuntimeState = "missing" | "running" | "stopped" | "unknown";

export type MariaDbInstance = {
  authMode: MariaDbAuthMode;
  composeFile: string;
  container: string;
  existing: boolean;
  hostPort: number;
  name: string;
  state: ContainerRuntimeState;
  status?: string;
  version: string;
  volume: string;
};

export type PhpMyAdminOverview = {
  container: string;
  domain?: string;
  state: ContainerRuntimeState;
  status?: string;
};

export type MariaDbInstanceForm = {
  authMode: MariaDbAuthMode;
  password: string;
  port?: string;
  rootPassword: string;
  user: string;
  version: string;
};

export type MariaDbImportForm = {
  database: string;
  filePath: string;
};

export type MariaDbExportForm = {
  database: string;
  filePath: string;
};

export type PostgresInstance = {
  composeFile: string;
  container: string;
  database: string;
  existing: boolean;
  hostPort: number;
  name: string;
  state: ContainerRuntimeState;
  status?: string;
  user: string;
  version: string;
  volume: string;
};

export type PgAdminOverview = {
  container: string;
  domain?: string;
  state: ContainerRuntimeState;
  status?: string;
};

export type PostgresInstanceForm = {
  database: string;
  password: string;
  user: string;
  version: string;
};

export type StreamState = "ready" | "running" | "done" | "error" | "stopped";
export type ServiceRuntimeState = "missing" | "partial" | "running" | "stopped" | "unknown";

export type ServiceStatus = {
  id: ServiceViewId;
  error?: string;
  running: number;
  state: ServiceRuntimeState;
  total: number;
};
