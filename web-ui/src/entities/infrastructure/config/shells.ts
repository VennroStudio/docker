import commandManifest from "../../../../commands.manifest.json";
import type { ShellAction, ViewId } from "../model/types";

type ShellGroupId = Exclude<ViewId, "home">;
type ManifestShell = {
  container: string;
  label: string;
};

const shellGroups = commandManifest.shells as Record<ShellGroupId, ManifestShell[]>;

export const serviceShells = Object.fromEntries(
  Object.entries(shellGroups).map(([view, shells]) => [
    view,
    shells.map((shell) => ({
      ...shell,
      detail: shell.container,
    })),
  ]),
) as Record<ShellGroupId, ShellAction[]>;
