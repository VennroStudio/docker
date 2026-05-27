import { ArrowRight, Boxes } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";
import { Button } from "@/shared/ui";

type HomeHeroProps = {
  text: AppText;
  onOpenProxy: () => void;
};

export function HomeHero({ onOpenProxy, text }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-sky-100/90 bg-white/78 p-6 shadow-[0_18px_42px_rgba(14,165,233,0.13),0_8px_22px_rgba(168,85,247,0.08)] ring-1 ring-fuchsia-100/55 backdrop-blur">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase text-teal-700">{text.home.hero.eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
          {text.home.hero.title}
        </h1>
        <span className="mt-3 block max-w-2xl text-sm leading-6 text-slate-600">{text.home.hero.lead}</span>
      </div>

      <div className="mt-5">
        <Button tone="primary" icon={<ArrowRight size={17} />} onClick={onOpenProxy}>
          {text.home.hero.action}
        </Button>
      </div>

      <div className="absolute right-6 top-6 hidden text-slate-100 md:block" aria-hidden="true">
        <Boxes size={86} strokeWidth={1.5} />
      </div>
    </section>
  );
}
