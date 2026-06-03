import type { ReactNode } from "react";

export function ProjectInfoBlock({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <section
      className={`rounded-lg border border-sky-100 bg-white/70 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.08)] ${className}`}
    >
      <h3 className="text-xs font-semibold uppercase text-teal-700">{title}</h3>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

export function ProjectInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <strong className="min-w-0 truncate text-right font-semibold text-slate-800">{value || "-"}</strong>
    </div>
  );
}
