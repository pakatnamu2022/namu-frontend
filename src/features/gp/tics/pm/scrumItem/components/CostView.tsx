"use client";

import { useMemo } from "react";
import { DollarSign, Wallet, Layers } from "lucide-react";
import { ScrumItemResource, ScrumItemStatus } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";
import { Badge } from "@/components/ui/badge";

interface Props {
  items: ScrumItemResource[];
  hourlyCost: number;
  isLoading: boolean;
}

interface DomainCost {
  id: number;
  title: string;
  estimatedHours: number;
  itemCount: number;
}

const STATUS_LABEL: Record<ScrumItemStatus, string> = {
  backlog: "Backlog",
  por_hacer: "Por hacer",
  en_progreso: "En progreso",
  en_revision: "En revisión",
  hecho: "Hecho",
};

const STATUS_COLOR: Record<ScrumItemStatus, string> = {
  backlog: "var(--chart-1)",
  por_hacer: "var(--chart-2)",
  en_progreso: "var(--chart-3)",
  en_revision: "var(--chart-4)",
  hecho: "var(--chart-5)",
};

function formatUsd(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  });
}

// El costo se calcula solo sobre las hojas del árbol (tareas sin hijos, o
// historias/funciones sueltas sin desglose), igual criterio que EffortView:
// si una historia tiene tareas, sus horas ya están repartidas entre ellas,
// sumar también las de la historia duplicaría el costo.
function buildCostBreakdown(items: ScrumItemResource[], hourlyCost: number) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const parentIds = new Set(items.filter((i) => i.parent_id).map((i) => i.parent_id));
  const leafItems = items.filter((i) => !parentIds.has(i.id));

  const domains = new Map<number, DomainCost>();
  const byStatus = new Map<ScrumItemStatus, number>();
  let totalEstimatedHours = 0;

  for (const item of leafItems) {
    // estimated_hours viene del backend como decimal cast, que Laravel
    // serializa como string ("8.00"): sin el Number(), el += de más abajo
    // concatena texto en vez de sumar.
    const estimated = Number(item.estimated_hours ?? 0);
    totalEstimatedHours += estimated;
    byStatus.set(item.status, (byStatus.get(item.status) ?? 0) + estimated);

    const domainId = item.parent_id ?? item.id;
    const domainTitle = (item.parent_id ? byId.get(item.parent_id)?.title : item.title) ?? item.title;
    const existing = domains.get(domainId);
    domains.set(domainId, {
      id: domainId,
      title: domainTitle,
      estimatedHours: (existing?.estimatedHours ?? 0) + estimated,
      itemCount: (existing?.itemCount ?? 0) + 1,
    });
  }

  const breakdown = [...domains.values()]
    .map((d) => ({ ...d, estimatedCost: d.estimatedHours * hourlyCost }))
    .sort((a, b) => b.estimatedCost - a.estimatedCost);

  const totalEstimatedCost = totalEstimatedHours * hourlyCost;

  const statusBreakdown = [...byStatus.entries()]
    .map(([status, hours]) => ({
      status,
      hours,
      cost: hours * hourlyCost,
      pct: totalEstimatedHours > 0 ? (hours / totalEstimatedHours) * 100 : 0,
    }))
    .sort((a, b) => b.cost - a.cost);

  return { breakdown, statusBreakdown, totalEstimatedHours, totalEstimatedCost, leafCount: leafItems.length };
}

export function CostView({ items, hourlyCost, isLoading }: Props) {
  const { breakdown, statusBreakdown, totalEstimatedHours, totalEstimatedCost, leafCount } = useMemo(
    () => buildCostBreakdown(items, hourlyCost),
    [items, hourlyCost],
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (totalEstimatedHours === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
        <DollarSign className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium">Sin datos suficientes</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Asigna horas estimadas a los items para ver el costo proyectado (horas × costo hora-hombre).
        </p>
      </div>
    );
  }

  const maxDomainCost = breakdown[0]?.estimatedCost ?? 1;

  return (
    <div className="flex-1 overflow-auto p-2 flex flex-col gap-3">
      {/* Métricas compactas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted/40 shadow-sm p-3.5 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
            <Wallet className="size-3.5" />
            Costo estimado
          </div>
          <div className="text-xl font-bold tracking-tight">{formatUsd(totalEstimatedCost)}</div>
          <div className="text-[11px] text-muted-foreground">
            {totalEstimatedHours.toLocaleString("es-PE", { maximumFractionDigits: 1 })} h × {formatUsd(hourlyCost, 2)}
          </div>
        </div>

        <div className="rounded-xl bg-card shadow-sm p-3.5 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
            <DollarSign className="size-3.5" />
            Hora-hombre
          </div>
          <div className="text-xl font-semibold">{formatUsd(hourlyCost, 2)}</div>
          <div className="text-[11px] text-muted-foreground">Configurado en el proyecto</div>
        </div>

        <div className="rounded-xl bg-card shadow-sm p-3.5 flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
            <Layers className="size-3.5" />
            Items con horas
          </div>
          <div className="text-xl font-semibold">{leafCount}</div>
          <div className="text-[11px] text-muted-foreground">{breakdown.length} historias/funciones</div>
        </div>
      </div>

      {/* Distribución por estado: chips en vez de gráfico */}
      <div className="rounded-xl bg-card shadow-sm p-3.5 flex flex-wrap gap-2">
        {statusBreakdown.map((s) => (
          <div
            key={s.status}
            className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2.5 py-1.5 text-[11px]"
          >
            <span className="size-2 rounded-sm shrink-0" style={{ backgroundColor: STATUS_COLOR[s.status] }} />
            <span className="font-medium">{STATUS_LABEL[s.status]}</span>
            <span className="text-muted-foreground">{formatUsd(s.cost)}</span>
            <span className="text-muted-foreground">· {s.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>

      {/* Detalle por historia, de mayor a menor costo */}
      <div className="rounded-xl bg-card shadow-sm p-3.5 flex flex-col">
        <p className="text-xs font-medium mb-1">Detalle por historia</p>
        <p className="text-[11px] text-muted-foreground mb-2">Por qué cuesta así, de mayor a menor.</p>
        <div className="flex flex-col gap-2">
          {breakdown.map((d) => (
            <div key={d.id} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate">{d.title}</span>
                <span className="flex items-center gap-2 shrink-0 text-muted-foreground">
                  <Badge variant="outline" className="text-[10px]">
                    {d.itemCount} {d.itemCount === 1 ? "item" : "items"}
                  </Badge>
                  <span className="font-medium text-foreground">{formatUsd(d.estimatedCost)}</span>
                </span>
              </div>
              <div className="h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: `${Math.max(4, (d.estimatedCost / maxDomainCost) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
