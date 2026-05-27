export const selectClassName =
  "h-10 min-w-0 rounded-lg border border-sky-100 bg-white px-3 text-sm text-slate-950 shadow-[0_5px_14px_rgba(15,23,42,0.08)] outline-none transition focus:border-teal-500/70 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50";

export function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
