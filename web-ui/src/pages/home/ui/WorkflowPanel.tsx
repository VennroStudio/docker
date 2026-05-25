import { CheckCircle2 } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";

type WorkflowPanelProps = {
  text: AppText;
};

export function WorkflowPanel({ text }: WorkflowPanelProps) {
  return (
    <section className="rounded-lg border border-zinc-800/90 bg-zinc-950/42 p-4">
      <div className="mb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">{text.home.workflow.eyebrow}</p>
          <h2 className="mt-1 text-xl font-bold text-zinc-50">{text.home.workflow.title}</h2>
        </div>
      </div>

      <div className="grid gap-3 min-[1400px]:grid-cols-3">
        {text.home.workflow.steps.map((step, index) => (
          <article className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-950/54 p-4" key={step.title}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-zinc-700/80 bg-zinc-900 text-xs font-bold text-zinc-400">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <strong className="block text-sm font-bold text-zinc-50">{step.title}</strong>
              <p className="mt-1 text-sm leading-6 text-zinc-400">{step.detail}</p>
            </div>
            <CheckCircle2 className="shrink-0 text-emerald-300" size={18} strokeWidth={2.25} />
          </article>
        ))}
      </div>
    </section>
  );
}
