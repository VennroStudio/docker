import type { AppText } from "./types";
import { enAnsible } from "./en/ansible";
import { enActions } from "./en/actions";
import { enCommon } from "./en/common";
import { enOperationToast } from "./en/operationToast";
import { enShell } from "./en/shell";
import { enConfirm } from "./en/confirm";
import { enHome } from "./en/home";
import { enMariadbInstances } from "./en/mariadbInstances";
import { enPostgresInstances } from "./en/postgresInstances";
import { enProjects } from "./en/projects";
import { enPanels } from "./en/panels";
import { enUtilities } from "./en/utilities";
import { enSsh } from "./en/ssh";
import { enServicePages } from "./en/servicePages";
import { enSettings } from "./en/settings";
import { enViews } from "./en/views";

export const en: AppText = {
  ansible: enAnsible,
  actions: enActions,
  common: enCommon,
  operationToast: enOperationToast,
  shell: enShell,
  confirm: enConfirm,
  home: enHome,
  mariadbInstances: enMariadbInstances,
  postgresInstances: enPostgresInstances,
  projects: enProjects,
  panels: enPanels,
  utilities: enUtilities,
  ssh: enSsh,
  servicePages: enServicePages,
  settings: enSettings,
  views: enViews,
};
