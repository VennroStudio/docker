import type { AppText, SshKeyForm, SshServerForm } from "@/entities/infrastructure";

export function validateSshServerForm(form: SshServerForm, copy: AppText["ssh"]) {
  if (!form.name.trim()) return copy.validation.name;
  if (!form.host.trim()) return copy.validation.host;
  if (!form.user.trim()) return copy.validation.user;
  if (!/^\d+$/.test(form.port) || Number(form.port) < 1 || Number(form.port) > 65535) {
    return copy.validation.port;
  }
  if (form.authType === "password" && form.passwordMode === "sshpass" && !form.password)
    return copy.validation.password;
  if (form.authType === "key" && !form.keyPath.trim()) return copy.validation.password;
  return "";
}

export function validateSshKeyForm(form: SshKeyForm, copy: AppText["ssh"]) {
  if (!form.serverId) return copy.validation.server;
  return "";
}
