import { ArrowUpRight } from "lucide-react";
import { getViewById } from "@/entities/infrastructure";
import type { AppText } from "@/entities/infrastructure";
import type { HomeCardViewId, ServiceStatus } from "@/entities/infrastructure";
import type { HomeService } from "../model/homeSections";

type ServiceTileProps = {
  service: HomeService;
  status?: ServiceStatus;
  text: AppText;
  onOpen: (viewId: HomeCardViewId) => void;
};

export function ServiceTile({ onOpen, service, status, text }: ServiceTileProps) {
  const view = getViewById(service.id);
  const Icon = view.icon;
  const card = text.home.serviceCards[service.id];
  const state = status?.state || "unknown";

  return (
    <button
      className="group flex min-h-36 items-start gap-4 rounded-lg border border-sky-100 bg-white/82 p-4 text-left shadow-[0_12px_28px_rgba(14,165,233,0.10),0_5px_14px_rgba(168,85,247,0.06)] transition hover:border-teal-300 hover:bg-teal-50/35 hover:shadow-[0_16px_34px_rgba(14,165,233,0.15),0_7px_20px_rgba(168,85,247,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30"
      type="button"
      onClick={() => onOpen(service.id)}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-teal-300 bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 text-teal-700 shadow-[0_8px_18px_rgba(20,184,166,0.14)]">
        <Icon size={19} strokeWidth={2.25} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mb-2 flex flex-wrap items-center gap-2">
          <small className="text-xs font-semibold uppercase text-slate-500">{card?.meta}</small>
          {status ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 shadow-[0_4px_10px_rgba(14,165,233,0.08)]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  state === "running"
                    ? "bg-[#52ff8f] shadow-[0_0_12px_rgba(82,255,143,0.75)]"
                    : state === "partial"
                      ? "bg-teal-300"
                      : state === "stopped"
                        ? "bg-amber-300"
                        : "bg-slate-400"
                }`}
              />
              {text.common.statusLabels[status.state]} {status.running}/{status.total}
            </span>
          ) : null}
        </span>
        <strong className="block truncate text-base font-bold text-slate-950">{card?.title}</strong>
        <span className="mt-2 block text-sm leading-6 text-slate-600">{card?.description}</span>
      </span>
      <ArrowUpRight
        className="mt-1 shrink-0 text-slate-400 transition group-hover:text-teal-700"
        size={16}
        strokeWidth={2.4}
      />
    </button>
  );
}
