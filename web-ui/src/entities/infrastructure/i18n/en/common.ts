import type { AppText } from "../types";

export const enCommon = {
  cancel: "Cancel",
  clear: "Clear",
  hide: "Hide",
  link: "Link",
  panels: "panels",
  statusLabels: {
    missing: "missing",
    partial: "partial",
    running: "running",
    stopped: "stopped",
    unknown: "unknown",
  },
  stop: "Stop",
  streamLabels: {
    done: "done",
    error: "error",
    ready: "ready",
    running: "running",
    stopped: "stopped",
  },
  terminal: "Terminal",
} satisfies AppText["common"];
