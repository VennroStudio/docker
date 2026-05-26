import type { ProxyFormState } from "@/entities/infrastructure";

export function isValidProxyForm(form: ProxyFormState): boolean {
  return isValidDomain(form.domain) && isValidTarget(form.target) && isValidPort(form.port);
}

export function isValidHostForm(form: ProxyFormState): boolean {
  return isValidDomain(form.domain);
}

export function getProxyFieldValidity(form: ProxyFormState) {
  return {
    domain: isValidDomain(form.domain),
    port: isValidPort(form.port),
    target: isValidTarget(form.target),
  };
}

function isValidDomain(value: string): boolean {
  return /^[a-zA-Z0-9.-]+$/.test(value.trim());
}

function isValidTarget(value: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(value.trim());
}

function isValidPort(value: string): boolean {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65535;
}
