import { ArrowRight, Boxes } from "lucide-react";
import type { AppText } from "@/entities/infrastructure";
import { Button } from "@/shared/ui";

type HomeHeroProps = {
  text: AppText;
  onOpenProxy: () => void;
};

export function HomeHero({ onOpenProxy, text }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/58 p-6 shadow-sm shadow-black/20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase text-teal-300/80">{text.home.hero.eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight text-zinc-50 md:text-4xl">
          {text.home.hero.title}
        </h1>
        <span className="mt-3 block max-w-2xl text-sm leading-6 text-zinc-400">{text.home.hero.lead}</span>
      </div>

      <div className="mt-5">
        <Button tone="primary" icon={<ArrowRight size={17} />} onClick={onOpenProxy}>
          {text.home.hero.action}
        </Button>
      </div>

      <div className="absolute right-6 top-6 hidden text-zinc-800 md:block" aria-hidden="true">
        <Boxes size={86} strokeWidth={1.5} />
      </div>
    </section>
  );
}
