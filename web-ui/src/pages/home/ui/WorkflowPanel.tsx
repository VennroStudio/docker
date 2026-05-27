import { CheckCircle2 } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";

type WorkflowPanelProps = {
  text: AppText;
};

export function WorkflowPanel({ text }: WorkflowPanelProps) {
  return (
    <section className="rounded-lg border border-sky-100/90 bg-white/70 p-4 shadow-[0_14px_34px_rgba(14,165,233,0.11),0_6px_18px_rgba(168,85,247,0.07)] ring-1 ring-fuchsia-100/40 backdrop-blur">
      <div className="mb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{text.home.workflow.eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">{text.home.workflow.title}</h2>
        </div>
      </div>

      <div className="grid gap-3 min-[1400px]:grid-cols-3">
        {text.home.workflow.steps.map((step, index) => (
          <article
            className="flex gap-3 rounded-lg border border-sky-100 bg-white/82 p-4 shadow-[0_10px_24px_rgba(14,165,233,0.10)]"
            key={step.title}
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-sky-100 bg-sky-50 text-xs font-bold text-slate-500 shadow-[0_5px_12px_rgba(14,165,233,0.10)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-sm font-bold text-slate-950">{step.title}</strong>
              <p className="mt-1 text-sm leading-6 text-slate-600">{step.detail}</p>
            </div>
            <CheckCircle2 className="shrink-0 text-emerald-500" size={18} strokeWidth={2.25} />
          </article>
        ))}
      </div>
    </section>
  );
}
