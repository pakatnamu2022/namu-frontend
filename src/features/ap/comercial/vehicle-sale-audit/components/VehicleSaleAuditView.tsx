"use client";

import { useMemo, useState } from "react";
import {
  ChevronsDownUp,
  ChevronsUpDown,
  RefreshCw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import { useVehicleSaleAudit } from "../lib/vehicle-sale-audit.hook";
import {
  AuditAction,
  AuditCauseCode,
  VehicleSaleAuditRow,
} from "../lib/vehicle-sale-audit.interface";
import {
  ACTION_HINT,
  ACTION_LABEL,
  CAUSE_COLOR,
  CAUSE_SHORT,
  isFixPending,
} from "../lib/vehicle-sale-audit.constants";
import AuditVehicleCard from "./AuditVehicleCard";

type ActionFilter = "ALL" | AuditAction;

const ACTIONS: AuditAction[] = ["CORREGIR", "REVISAR", "SIN ACCIÓN"];

function MetricButton({
  label,
  value,
  hint,
  active,
  onClick,
}: {
  label: string;
  value: number;
  hint?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={cn(
        "rounded-xl bg-muted/40 p-4 text-left shadow-sm transition-all hover:shadow-md",
        active && "bg-primary/10 shadow-md",
      )}
    >
      <div className="text-3xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </button>
  );
}

export default function VehicleSaleAuditView() {
  const { data, isLoading, isFetching, error, refetch } = useVehicleSaleAudit();
  const [action, setAction] = useState<ActionFilter>("ALL");
  const [cause, setCause] = useState<AuditCauseCode | null>(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data?.rows ?? []).filter(
      (row) =>
        (action === "ALL" || row.action === action) &&
        (!cause || row.cause === cause) &&
        (!term || row.vin.toLowerCase().includes(term)),
    );
  }, [data, action, cause, search]);

  const grouped = useMemo(() => {
    if (!data) return [];
    const groups = new Map<AuditCauseCode, VehicleSaleAuditRow[]>();
    filtered.forEach((row) => {
      groups.set(row.cause, [...(groups.get(row.cause) ?? []), row]);
    });
    return data.causes
      .map((c) => ({ cause: c, rows: groups.get(c.code) ?? [] }))
      .filter((group) => group.rows.length > 0);
  }, [data, filtered]);

  const toggle = (vin: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(vin)) next.delete(vin);
      else next.add(vin);
      return next;
    });

  const allExpanded =
    filtered.length > 0 && filtered.every((row) => expanded.has(row.vin));
  const toggleAll = () =>
    setExpanded(allExpanded ? new Set() : new Set(filtered.map((r) => r.vin)));

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl bg-red-50 p-6 text-center shadow-sm dark:bg-red-950/30">
          <h3 className="mb-1 text-sm font-semibold text-red-900 dark:text-red-200">
            Error al cargar la auditoría
          </h3>
          <p className="text-xs text-red-600 dark:text-red-300">
            {error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <TitleComponent
        title="Auditoría de estados de venta"
        subtitle="Vehículos vendidos que volvieron a inventario · solo lectura, no modifica datos"
        icon="ShieldAlert"
      >
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
          Actualizar
        </Button>
      </TitleComponent>

      {isLoading || !data ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-8 pb-8">
          {/* Resumen por acción */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MetricButton
              label="Vehículos afectados"
              value={data.summary.total - data.summary.none}
              active={action === "ALL"}
              onClick={() => setAction("ALL")}
              hint="Sin contar los que ya están correctos"
            />
            {ACTIONS.map((a) => (
              <MetricButton
                key={a}
                label={ACTION_LABEL[a]}
                value={
                  a === "CORREGIR"
                    ? data.summary.fix
                    : a === "REVISAR"
                      ? data.summary.review
                      : data.summary.none
                }
                hint={ACTION_HINT[a]}
                active={action === a}
                onClick={() => setAction(action === a ? "ALL" : a)}
              />
            ))}
          </div>

          {/* Clasificación por causa */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide">
              Causas encontradas
            </h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.causes.map((c) => {
                const pending = isFixPending(c.fix);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setCause(cause === c.code ? null : c.code)}
                    className={cn(
                      "flex gap-4 rounded-xl bg-card p-4 text-left shadow-sm transition-all hover:shadow-md",
                      cause === c.code && "bg-primary/10 shadow-md",
                    )}
                  >
                    <div className="min-w-10 text-3xl font-semibold tabular-nums">
                      {c.count}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2 break-words">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge color={CAUSE_COLOR[c.code]} variant="ghost">
                          {CAUSE_SHORT[c.code]}
                        </Badge>
                        <Badge color={pending ? "amber" : "emerald"}>
                          {pending ? "Solución pendiente" : "Resuelto en código"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium leading-snug">
                        {c.title}
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {c.text}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Dónde:{" "}
                        </span>
                        {c.where}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          Solución:{" "}
                        </span>
                        {c.fix}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Filtros */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por VIN"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <span className="w-full sm:w-auto">
                {filtered.length} de {data.rows.length} vehículos
              </span>
              {(cause || action !== "ALL" || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCause(null);
                    setAction("ALL");
                    setSearch("");
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={toggleAll}>
                {allExpanded ? (
                  <ChevronsDownUp className="size-4" />
                ) : (
                  <ChevronsUpDown className="size-4" />
                )}
                {allExpanded ? "Contraer todo" : "Expandir todo"}
              </Button>
            </div>
          </div>

          {/* Detalle agrupado por causa */}
          {grouped.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Ningún vehículo coincide con los filtros.
            </p>
          ) : (
            grouped.map(({ cause: c, rows }) => (
              <section key={c.code} className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold">{c.title}</h3>
                    <Badge color={CAUSE_COLOR[c.code]} variant="ghost">
                      {rows.length}
                    </Badge>
                  </div>
                  <p className="max-w-4xl text-sm text-muted-foreground">
                    {c.text}
                  </p>
                </div>
                <div className="space-y-3">
                  {rows.map((row) => (
                    <AuditVehicleCard
                      key={row.vin}
                      row={row}
                      expanded={expanded.has(row.vin)}
                      onToggle={() => toggle(row.vin)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}

          <p className="text-xs text-muted-foreground">
            Generado el {data.generated_at}. El estado y el almacén propuestos
            son una simulación: ninguno se ha aplicado.
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
