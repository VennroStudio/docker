import type { AppText } from "@/entities/infrastructure";
import type { AppSettings } from "@/entities/settings";

export type SettingsGroup = keyof AppSettings;

export type SettingsFieldDefinition = {
  autocomplete?: string;
  env: string;
  group: SettingsGroup;
  label: string;
  name: string;
  placeholder?: string;
  type?: "number" | "password" | "text";
};

export type SettingsSectionDefinition = {
  id: keyof AppText["settings"]["sections"];
  fields: SettingsFieldDefinition[];
};

export const settingsSections: SettingsSectionDefinition[] = [
  {
    id: "proxy",
    fields: [
      { autocomplete: "username", env: "NPM_EMAIL", group: "proxy", label: "NPM email", name: "npmEmail" },
      {
        autocomplete: "current-password",
        env: "NPM_PASSWORD",
        group: "proxy",
        label: "NPM password",
        name: "npmPassword",
        type: "password",
      },
    ],
  },
  {
    id: "pgadmin",
    fields: [
      {
        autocomplete: "username",
        env: "PGADMIN_EMAIL",
        group: "pgadmin",
        label: "pgAdmin email",
        name: "pgaEmail",
      },
      {
        autocomplete: "current-password",
        env: "PGADMIN_PASSWORD",
        group: "pgadmin",
        label: "pgAdmin password",
        name: "pgaPassword",
        type: "password",
      },
    ],
  },
  {
    id: "redis",
    fields: [
      {
        autocomplete: "current-password",
        env: "REDIS_PASSWORD",
        group: "redis",
        label: "Redis password",
        name: "redisPassword",
        type: "password",
      },
    ],
  },
  {
    id: "rustfs",
    fields: [
      {
        autocomplete: "username",
        env: "RUSTFS_ACCESS_KEY",
        group: "rustfs",
        label: "RustFS access key",
        name: "rustfsAccessKey",
      },
      {
        autocomplete: "current-password",
        env: "RUSTFS_SECRET_KEY",
        group: "rustfs",
        label: "RustFS secret key",
        name: "rustfsSecretKey",
        type: "password",
      },
    ],
  },
  {
    id: "registry",
    fields: [
      {
        env: "REGISTRY_PORT",
        group: "registry",
        label: "Registry port",
        name: "registryPort",
        placeholder: "5051",
        type: "number",
      },
      {
        env: "REGISTRY_UI_PORT",
        group: "registry",
        label: "Registry UI port",
        name: "registryUiPort",
        placeholder: "5081",
        type: "number",
      },
      {
        autocomplete: "username",
        env: "REGISTRY_USER",
        group: "registry",
        label: "Registry user",
        name: "registryUser",
      },
      {
        autocomplete: "current-password",
        env: "REGISTRY_PASSWORD",
        group: "registry",
        label: "Registry password",
        name: "registryPassword",
        type: "password",
      },
    ],
  },
];
