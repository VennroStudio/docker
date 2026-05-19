import { ArrowRight, Boxes } from "lucide-react";
import type { AppText } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/Button";

type HomeHeroProps = {
  text: AppText;
  onOpenProxy: () => void;
};

export function HomeHero({ onOpenProxy, text }: HomeHeroProps) {
  return (
    <section className="home-hero">
      <div className="home-hero-copy">
        <p>{text.home.hero.eyebrow}</p>
        <h1>{text.home.hero.title}</h1>
        <span>{text.home.hero.lead}</span>
      </div>

      <div className="home-hero-actions">
        <Button tone="primary" icon={<ArrowRight size={17} />} onClick={onOpenProxy}>
          {text.home.hero.action}
        </Button>
      </div>

      <div className="home-hero-mark" aria-hidden="true">
        <Boxes size={86} strokeWidth={1.5} />
      </div>
    </section>
  );
}
