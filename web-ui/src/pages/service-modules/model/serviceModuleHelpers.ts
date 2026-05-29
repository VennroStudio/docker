import type { ShellAction } from "@/entities/infrastructure";

export function findShell(shells: ShellAction[], container: string) {
  return shells.find((shell) => shell.container === container);
}

export function serviceLink(label: string, url?: string) {
  return url ? { label, source: "settings" as const, url } : undefined;
}
