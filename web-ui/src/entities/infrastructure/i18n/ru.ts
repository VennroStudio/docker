import type { AppText } from "./types";
import { ruActions } from "./ru/actions";
import { ruCommon } from "./ru/common";
import { ruOperationToast } from "./ru/operationToast";
import { ruShell } from "./ru/shell";
import { ruConfirm } from "./ru/confirm";
import { ruHome } from "./ru/home";
import { ruMariadbInstances } from "./ru/mariadbInstances";
import { ruPostgresInstances } from "./ru/postgresInstances";
import { ruPanels } from "./ru/panels";
import { ruUtilities } from "./ru/utilities";
import { ruServicePages } from "./ru/servicePages";
import { ruSettings } from "./ru/settings";
import { ruViews } from "./ru/views";

export const ru: AppText = {
  actions: ruActions,
  common: ruCommon,
  operationToast: ruOperationToast,
  shell: ruShell,
  confirm: ruConfirm,
  home: ruHome,
  mariadbInstances: ruMariadbInstances,
  postgresInstances: ruPostgresInstances,
  panels: ruPanels,
  utilities: ruUtilities,
  servicePages: ruServicePages,
  settings: ruSettings,
  views: ruViews,
};
