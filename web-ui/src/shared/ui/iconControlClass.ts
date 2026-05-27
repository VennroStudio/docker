import { cn } from "@/shared/lib";

export type IconControlTone = "danger" | "default" | "primary" | "success";

export function iconControlClass(tone: IconControlTone) {
  return cn(
    "grid h-9 w-9 place-items-center rounded-lg border transition outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60 disabled:cursor-not-allowed disabled:opacity-45",
    {
      danger:
        "border-red-300 bg-red-50 text-red-700 shadow-[0_7px_16px_rgba(249,115,22,0.17)] hover:border-red-400 hover:bg-red-100",
      default:
        "border-sky-100 bg-white text-slate-600 shadow-[0_7px_16px_rgba(14,165,233,0.12)] hover:border-sky-200 hover:text-slate-950",
      primary:
        "border-teal-300 bg-teal-50 text-teal-700 shadow-[0_7px_16px_rgba(20,184,166,0.18)] hover:border-teal-500 hover:bg-teal-100",
      success:
        "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-[0_7px_16px_rgba(34,197,94,0.18)] hover:border-emerald-400 hover:bg-emerald-100",
    }[tone],
  );
}
