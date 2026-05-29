import type { LucideIcon } from "lucide-react";
import commandManifest from "../../../../commands.manifest.json";
export type ViewId =
  | "home"
  | "proxy"
  | "nginx"
  | "mariadb"
  | "postgres"
  | "redis"
  | "minio"
  | "registry"
  | "utilities"
  | "settings";
export type ServiceViewId = Exclude<ViewId, "home" | "settings" | "utilities">;
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
export type ContainerRuntimeState =
  | "created"
  | "dead"
  | "exited"
  | "missing"
  | "paused"
  | "removing"
  | "restarting"
  | "running"
  | "stopped"
  | "unknown";

export type ContainerStateInfo = {
  error?: string;
  state: ContainerRuntimeState;
  status?: string;
};

export type ServiceLink = {
  domain?: string;
  label: string;
  port?: number;
  source: string;
  url: string;
};

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
  state: ContainerRuntimeState;
  status?: string;
  url?: string;
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
  container: string;
  database: string;
  filePath: string;
};

export type MariaDbExportForm = {
  container: string;
  database: string;
  filePath: string;
};

export type MariaDbDatabaseForm = {
  container: string;
  database: string;
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
  state: ContainerRuntimeState;
  status?: string;
  url?: string;
};

export type PostgresInstanceForm = {
  database: string;
  password: string;
  user: string;
  version: string;
};

export type PostgresImportForm = {
  container: string;
  database: string;
  filePath: string;
};

export type PostgresExportForm = {
  container: string;
  database: string;
  filePath: string;
};

export type PostgresDatabaseForm = {
  container: string;
  database: string;
};

export type ArchiveFile = {
  modifiedAt: string;
  name: string;
  path: string;
  size: number;
};

export type ArchiveCreateForm = {
  folder: string;
  name: string;
};

export type ArchiveExtractForm = {
  dest: string;
  name: string;
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
