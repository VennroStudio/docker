import type { CommandAction, ContainerStateInfo, ServiceLink, ShellAction } from "@/entities/infrastructure";
import type { SettingsConfigField } from "@/features/manage-settings";

export type ServiceModuleConfigSection = {
  fields: SettingsConfigField[];
  generateEnvAfterSave?: boolean;
};

export type ServiceModuleDescriptor = {
  actions: CommandAction[];
  configSection?: ServiceModuleConfigSection;
  details?: Array<{ href?: string; label: string; value?: string }>;
  eyebrow: string;
  link?: ServiceLink;
  shell?: ShellAction;
  stateEyebrow?: boolean;
  status?: ContainerStateInfo;
  statusLabel: string;
  title: string;
};
