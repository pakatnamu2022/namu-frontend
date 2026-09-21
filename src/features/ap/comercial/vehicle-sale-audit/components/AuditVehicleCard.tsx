"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, ChevronDown, Undo2, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CopyCell } from "@/shared/components/CopyCell";
import { VehicleSaleAuditRow } from "../lib/vehicle-sale-audit.interface";
import {
  ACTION_COLOR,
  ACTION_LABEL,
  CAUSE_COLOR,
  CAUSE_SHORT,
  formatDateTime,
} from "../lib/vehicle-sale-audit.constants";
import { simulateFix } from "../lib/vehicle-sale-audit.graph";
import AuditTimeline, { AuditTimelineLegend } from "./AuditTimeline";

type Stage = "before" | "pulse" | "after";

function StateBox({
  label,
  status,
  warehouse,
  active,
  good,
}: {
  label: string;
  status: string;
  warehouse: string;
  active: boolean;
  good?: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.45, scale: active ? 1 : 0.97 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-lg px-4 py-2 shadow-sm",
        good && active ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-card",
      )}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold">{status}</div>
      <div className="text-xs text-muted-foreground">Almacén {warehouse}</div>
    </motion.div>
  );
}

interface Props {
  row: VehicleSaleAuditRow;
  expanded: boolean;
  onToggle: () => void;
}

function Section({
  title,
  items,
  text,
}: {
  title: string;
  items?: string[];
  text?: string;
}) {
  return (
    <div className="min-w-0 space-y-2 break-words">
      <h4 className="text-xs font-semibold uppercase tracking-wide">{title}</h4>
      {text && <p className="text-sm leading-relaxed">{text}</p>}
      {items && (
        <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed marker:text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AuditVehicleCard({ row, expanded, onToggle }: Props) {
  const unchangedWarehouse = !row.wh_changes;
  const [stage, setStage] = useState<Stage>("before");
  const canFix = row.action === "CORREGIR";
  const simulation = useMemo(
    () => simulateFix(row.timeline, row.cause),
    [row.timeline, row.cause],
  );

  // Resalta el movimiento culpable un instante y luego reacomoda la línea
  useEffect(() => {
    if (stage !== "pulse") return;
    const timer = setTimeout(() => setStage("after"), 1100);
    return () => clearTimeout(timer);
  }, [stage]);

  return (
    <div className="rounded-xl bg-card shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-3 p-4 text-left sm:p-5 md:flex-row md:items-center md:justify-between"
      >
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span onClick={(e) => e.stopPropagation()}>
              <CopyCell value={row.vin} size="lg" font="mono" />
            </span>
            <Badge color={ACTION_COLOR[row.action]}>
              {ACTION_LABEL[row.action]}
            </Badge>
            <Badge color={CAUSE_COLOR[row.cause]} variant="ghost">
              {CAUSE_SHORT[row.cause]}
            </Badge>
          </div>
          {!expanded && row.happened[0] && (
            <p className="line-clamp-2 max-w-4xl text-sm text-muted-foreground">
              {row.happened[0]}
            </p>
          )}
        </div>

        <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-start">
          <div className="min-w-0 space-y-0.5 text-sm md:text-right">
            <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
              <span className="text-muted-foreground">{row.current}</span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <span className="font-semibold">{row.target}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {unchangedWarehouse
                ? `Almacén ${row.wh_current} (sin cambio)`
                : `Almacén ${row.wh_current} → ${row.wh_target}`}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="space-y-6 px-4 pb-6 pt-1 sm:px-5">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Section title="Qué pasó" items={row.happened} />
            <Section title="Qué está mal" items={row.wrong} />
            <Section title="Cómo se corrige el dato" text={row.fix} />
            <Section
              title="Cómo evitar que se repita"
              items={row.prevention}
            />
          </div>

          {row.invoices.length > 0 && (
            <div className="rounded-lg bg-muted/40 p-4 shadow-sm">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide">
                Comprobantes de venta vigentes
              </h4>
              <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                {row.invoices.map((invoice) => (
                  <div key={invoice.n}>
                    <span className="font-semibold">{invoice.n}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {invoice.date} · S/ {invoice.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide">
                Historia del vehículo
                {row.exit_id && (
                  <span className="ml-2 font-normal normal-case text-muted-foreground">
                    · devuelto a inventario el {formatDateTime(row.exit_at)}
                  </span>
                )}
              </h4>
              <AuditTimelineLegend />
            </div>
            {canFix && (
              <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <StateBox
                    label="Antes"
                    status={row.current}
                    warehouse={row.wh_current}
                    active={stage !== "after"}
                  />
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <StateBox
                    label="Después"
                    status={row.target}
                    warehouse={row.wh_target}
                    active={stage === "after"}
                    good
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {stage === "before" && (
                    <>
                      <span className="text-xs text-muted-foreground">
                        Simula el resultado, no modifica datos.
                      </span>
                      <Button onClick={() => setStage("pulse")}>
                        <Wand2 className="size-4" />
                        Corregir
                      </Button>
                    </>
                  )}
                  {stage === "pulse" && (
                    <span className="text-sm text-muted-foreground">
                      Ubicando el movimiento que causó el problema…
                    </span>
                  )}
                  {stage === "after" && (
                    <>
                      <span className="text-xs text-muted-foreground">
                        Aún no aplica: falta conectar la escritura.
                      </span>
                      <Button variant="ghost" onClick={() => setStage("before")}>
                        <Undo2 className="size-4" />
                        Ver el antes
                      </Button>
                      <Button disabled>
                        <Check className="size-4" />
                        Confirmar corrección
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
            <AuditTimeline
              events={stage === "after" ? simulation.events : row.timeline}
              pulseIds={stage === "pulse" ? simulation.affectedIds : []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
