import type { CommandAction, ContainerStateInfo, ServiceLink, ShellAction } from "@/entities/infrastructure";
import type { SettingsConfigField } from "@/entities/settings";

export type ServiceModuleConfigSection = {
  eyebrow?: string;
  fields: SettingsConfigField[];
  generateEnvAfterSave?: boolean;
  title?: string;
};

export type ServiceModuleDescriptor = {
  actions: CommandAction[];
  configSection?: ServiceModuleConfigSection;
  configSections?: ServiceModuleConfigSection[];
  details?: Array<{ href?: string; label: string; value?: string }>;
  eyebrow: string;
  link?: ServiceLink;
  shell?: ShellAction;
  shellDisabled?: boolean;
  shellDisabledTitle?: string;
  stateEyebrow?: boolean;
  status?: ContainerStateInfo;
  statusLabel: string;
  title: string;
};
