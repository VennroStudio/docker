import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib";

type AccordionPanelProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  defaultTitleElement?: "strong" | "span";
  eyebrow: string;
  open: boolean;
  title: string;
  titlePrefix?: ReactNode;
  onOpenChange: (open: boolean) => void;
};

export function AccordionPanel({
  actions,
  children,
  className,
  contentClassName = "p-4",
  defaultTitleElement = "strong",
  eyebrow,
  onOpenChange,
  open,
  title,
  titlePrefix,
}: AccordionPanelProps) {
  const TitleElement = defaultTitleElement;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-950/54 shadow-sm shadow-black/20",
        className,
      )}
    >
      <header
        className="flex cursor-pointer items-center gap-4 px-4 py-3 transition hover:bg-white/[0.03]"
        onClick={() => onOpenChange(!open)}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase text-zinc-500">{eyebrow}</span>
          <span className="mt-1 flex min-w-0 items-center gap-2">
            {titlePrefix ? <span className="flex shrink-0">{titlePrefix}</span> : null}
            <TitleElement className="block min-w-0 truncate text-base font-bold text-zinc-50">{title}</TitleElement>
          </span>
        </span>
        {actions ? (
          <span
            className="flex shrink-0 flex-wrap items-center justify-end gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            {actions}
          </span>
        ) : null}
        <ChevronDown
          className={cn("shrink-0 text-zinc-500 transition", open && "rotate-180 text-zinc-200")}
          size={18}
          strokeWidth={2.4}
        />
      </header>

      {open ? <div className={cn("border-t border-zinc-800", contentClassName)}>{children}</div> : null}
    </section>
  );
}
