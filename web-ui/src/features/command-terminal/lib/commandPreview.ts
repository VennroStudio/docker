import commandManifest from "../../../../commands.manifest.json";
import type { ArchiveCreateForm, ArchiveExtractForm, CommandId, ProxyFormState } from "@/entities/infrastructure";

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

export function archiveCreatePreview(form: ArchiveCreateForm): string {
  return `make archive NAME=${form.name} FOLDER=${form.folder}`;
}

export function archiveExtractPreview(form: ArchiveExtractForm): string {
  return `make unarchive NAME=${form.name} DEST=${form.dest}`;
}

export function archiveDeletePreview(name: string): string {
  return `make archive-delete NAME=${name}`;
}
