import commandManifest from "../../../../commands.manifest.json";
import type { CommandId, ProxyFormState } from "@/entities/infrastructure";

export function commandPreview(command: CommandId): string {
  return commandManifest.commands[command].preview;
}

export function proxyPreview(form: ProxyFormState): string {
  return [
    "make app-proxy",
    `DOMAIN=${form.domain}`,
    `TARGET=${form.target}`,
    `PORT=${form.port}`,
    form.ssl ? "SSL=1" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function proxyDeletePreview(domain: string): string {
  return `make app-proxy-remove DOMAIN=${domain}`;
}

export function hostPreview(action: "add" | "remove", domain: string): string {
  return action === "add" ? `make host-add DOMAIN=${domain}` : `make host-remove DOMAIN=${domain}`;
}
