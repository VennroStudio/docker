import type { AppText } from "./types";
import { enActions } from "./en/actions";
import { enCommon } from "./en/common";
import { enOperationToast } from "./en/operationToast";
import { enShell } from "./en/shell";
import { enConfirm } from "./en/confirm";
import { enHome } from "./en/home";
import { enMariadbInstances } from "./en/mariadbInstances";
import { enPostgresInstances } from "./en/postgresInstances";
import { enPanels } from "./en/panels";
import { enUtilities } from "./en/utilities";
import { enServicePages } from "./en/servicePages";
import { enSettings } from "./en/settings";
import { enViews } from "./en/views";

export const en: AppText = {
  actions: enActions,
  common: enCommon,
  operationToast: enOperationToast,
  shell: enShell,
  confirm: enConfirm,
  home: enHome,
  mariadbInstances: enMariadbInstances,
  postgresInstances: enPostgresInstances,
  panels: enPanels,
  utilities: enUtilities,
  servicePages: enServicePages,
  settings: enSettings,
  views: enViews,
};
