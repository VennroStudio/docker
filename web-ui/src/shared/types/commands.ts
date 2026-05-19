import type { LucideIcon } from "lucide-react";
import commandManifest from "../../../commands.manifest.json";

export type ViewId = "home" | "proxy" | "network" | "nginx" | "mariadb" | "postgres" | "redis" | "minio";
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

export type StreamState = "ready" | "running" | "done" | "error" | "stopped";
export type ServiceRuntimeState = "missing" | "partial" | "running" | "stopped" | "unknown";

export type ServiceStatus = {
  id: ServiceViewId;
  error?: string;
  running: number;
  state: ServiceRuntimeState;
  total: number;
};
