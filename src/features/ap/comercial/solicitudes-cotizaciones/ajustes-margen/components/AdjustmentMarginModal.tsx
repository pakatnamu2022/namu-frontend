"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { cn } from "@/lib/utils";
import { MarginProjection } from "../lib/purchaseRequestQuoteAdjustment.margin";
import { ADJUSTMENT_ACTION_LABEL } from "../lib/purchaseRequestQuoteAdjustment.constants";
import { AdjustmentAction } from "../lib/purchaseRequestQuoteAdjustment.interface";

export interface MarginModalLine {
  key: string;
  action: AdjustmentAction;
  isGift: boolean;
  label: string;
  /** Aporte de la línea al delta bruto (soles con IGV; + mejora, − empeora). */
  rawDelta: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projection: MarginProjection;
  lines: MarginModalLine[];
  currencySymbol: string;
  /** "Estimado · se revalida al aprobar" en el form; texto de estado en la vista. */
  note?: string;
}

const ACTION_TONE: Record<AdjustmentAction, string> = {
  create: "text-emerald-600 dark:text-emerald-400",
  update: "text-blue-600 dark:text-blue-400",
  delete: "text-red-600 dark:text-red-400",
};

/**
 * Modal con el desglose completo de cómo cada cambio agregado mueve el margen
 * (antes → aporte por línea → proyectado). Es el equivalente de "Ver Margen"
 * de la cotización, pero para la solicitud de ajuste.
 */
export default function AdjustmentMarginModal({
  open,
  onOpenChange,
  projection,
  lines,
  currencySymbol,
  note = "Estimado · contabilidad revalida al aprobar",
}: Props) {
  const { amountBefore, pctBefore, amountAfter, pctAfter, amountDelta, pctDelta } =
    projection;

  const positive = amountDelta > 0.004;
  const negative = amountDelta < -0.004;
  const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  const accent = positive
    ? "text-emerald-600 dark:text-emerald-400"
    : negative
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  const money = (v: number) => (
    <>
      {currencySymbol} <NumberFormat value={v.toFixed(2)} />
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn("size-5", accent)} />
            Impacto en el margen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Margen actual */}
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2.5 text-sm">
            <span className="text-muted-foreground">Margen actual</span>
            <span className="font-semibold">
              {money(amountBefore)}{" "}
              <span className="text-xs font-medium text-muted-foreground">
                (<NumberFormat value={pctBefore.toFixed(2)} />%)
              </span>
            </span>
          </div>

          {/* Aporte por línea */}
          <div className="rounded-xl bg-muted/30 px-3 py-2.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Cambios agregados
            </p>
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no has agregado ninguna línea de cambio.
              </p>
            ) : (
              <div className="space-y-1.5">
                {lines.map((line) => {
                  const netLine = line.rawDelta / 1.18;
                  const linePositive = netLine > 0.004;
                  const lineNegative = netLine < -0.004;
                  return (
                    <div
                      key={line.key}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 text-muted-foreground">
                        <span
                          className={cn(
                            "font-medium",
                            ACTION_TONE[line.action],
                          )}
                        >
                          {ADJUSTMENT_ACTION_LABEL[line.action]}
                        </span>{" "}
                        {line.isGift ? "Obsequio: " : ""}
                        {line.label}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 font-medium",
                          linePositive && "text-emerald-600 dark:text-emerald-400",
                          lineNegative && "text-red-600 dark:text-red-400",
                        )}
                      >
                        {linePositive ? "+ " : lineNegative ? "− " : ""}
                        {money(Math.abs(netLine))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ajuste neto total */}
          <div className="flex items-center justify-between px-3 text-sm font-semibold">
            <span>Ajuste neto</span>
            <span className={accent}>
              {positive ? "+ " : negative ? "− " : ""}
              {money(Math.abs(amountDelta))}
              <span className="ml-1 text-xs font-medium">
                ({pctDelta > 0 ? "+" : ""}
                <NumberFormat value={pctDelta.toFixed(2)} /> pts)
              </span>
            </span>
          </div>

          {/* Margen proyectado */}
          <div
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-3",
              positive || negative ? "bg-primary/10" : "bg-muted/50",
            )}
          >
            <span className="text-sm text-muted-foreground">
              Margen proyectado
            </span>
            <div className="text-right">
              <p className={cn("text-lg font-bold leading-tight", accent)}>
                {money(amountAfter)}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                {pctAfter >= 0 ? "+" : ""}
                <NumberFormat value={pctAfter.toFixed(2)} />%
              </p>
            </div>
          </div>

          <p className="px-3 text-xs text-muted-foreground">{note}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
