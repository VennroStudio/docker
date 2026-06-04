import type { AppText } from "../types";

export const enCommon = {
  cancel: "Cancel",
  clear: "Clear",
  containerActions: {
    clean: { label: "Clean", detail: "remove image" },
    down: { label: "Down", detail: "remove container" },
    logs: { label: "Logs", detail: "live stream" },
    shell: { label: "Shell", detail: "make shell" },
    start: { label: "Start", detail: "start container" },
    stop: { label: "Stop", detail: "stop service" },
    up: { label: "Up", detail: "docker compose up" },
  },
  hide: "Hide",
  link: "Link",
  panel: "panel",
  panels: "panels",
  statusLabels: {
    missing: "missing",
    partial: "partial",
    running: "running",
    stopped: "stopped",
    unknown: "unknown",
  },
  stop: "Stop",
  terminalStateLabels: {
    done: "done",
    error: "error",
    ready: "ready",
    running: "running",
    stopped: "stopped",
  },
  terminal: "Terminal",
} satisfies AppText["common"];
