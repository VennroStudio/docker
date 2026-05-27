import type { CommandAction, ContainerStateInfo, ServiceLink, ShellAction } from "@/entities/infrastructure";

export type ServiceModuleDescriptor = {
  actions: CommandAction[];
  details?: Array<{ href?: string; label: string; value?: string }>;
  eyebrow: string;
  link?: ServiceLink;
  shell?: ShellAction;
  status?: ContainerStateInfo;
  statusLabel: string;
  title: string;
};
