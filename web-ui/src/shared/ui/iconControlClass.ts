import { cn } from "@/shared/lib";

export type IconControlTone = "danger" | "default" | "primary" | "success";

export function iconControlClass(tone: IconControlTone) {
  return cn(
    "grid h-9 w-9 place-items-center rounded-lg border transition outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60",
    {
      danger: "border-red-400/25 bg-red-500/10 text-red-100 hover:border-red-300/60 hover:bg-red-500/18",
      default: "border-zinc-700/70 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-zinc-50",
      primary: "border-teal-300/30 bg-teal-400/10 text-teal-100 hover:border-teal-200/60 hover:bg-teal-400/18",
      success:
        "border-emerald-300/28 bg-emerald-400/10 text-emerald-100 hover:border-emerald-200/60 hover:bg-emerald-400/18",
    }[tone],
  );
}
