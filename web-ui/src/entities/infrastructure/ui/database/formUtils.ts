export const selectClassName =
  "h-10 min-w-0 rounded-lg border border-zinc-700/80 bg-zinc-950/72 px-3 text-sm text-zinc-100 outline-none transition focus:border-teal-300/70 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-not-allowed disabled:opacity-50";

export function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
