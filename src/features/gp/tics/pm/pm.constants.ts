import { ScrumItemStatus } from "./scrumItem/lib/scrumItem.interface";

export const STATUS_COLOR: Record<ScrumItemStatus, string> = {
  backlog: "bg-slate-100 text-slate-700",
  por_hacer: "bg-blue-100 text-blue-700",
  en_progreso: "bg-amber-100 text-amber-700",
  en_revision: "bg-purple-100 text-purple-700",
  hecho: "bg-emerald-100 text-emerald-700",
};

export const STATUS_LABEL: Record<ScrumItemStatus, string> = {
  backlog: "Backlog",
  por_hacer: "Por hacer",
  en_progreso: "En progreso",
  en_revision: "En revisión",
  hecho: "Hecho",
};
