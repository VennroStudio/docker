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
  type?: "password" | "text";
};

export type SettingsSectionDefinition = {
  id: keyof AppText["settings"]["sections"];
  fields: SettingsFieldDefinition[];
};

export const settingsSections: SettingsSectionDefinition[] = [
  {
    id: "proxy",
    fields: [
      {
        env: "NPM_URL",
        group: "proxy",
        label: "NPM URL",
        name: "npmUrl",
        placeholder: "http://localhost:81",
      },
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
    id: "phpmyadmin",
    fields: [
      {
        env: "PMA_URL",
        group: "phpmyadmin",
        label: "phpMyAdmin URL",
        name: "pmaUrl",
        placeholder: "http://localhost:8080",
      },
    ],
  },
  {
    id: "pgadmin",
    fields: [
      {
        env: "PGA_URL",
        group: "pgadmin",
        label: "pgAdmin URL",
        name: "pgaUrl",
        placeholder: "http://localhost:5050",
      },
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
];
