import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { cn } from "@/lib/utils";
import { MarginProjection } from "../lib/purchaseRequestQuoteAdjustment.margin";

interface Props {
  projection: MarginProjection;
  currencySymbol: string;
  /** Cantidad de líneas de cambio agregadas: si es 0, se muestra el estado neutro. */
  changeCount: number;
  subtitle?: string;
}

/**
 * Panel de impacto en el margen — se actualiza en vivo a medida que se agregan
 * líneas de cambio (no espera al envío). El valor es un estimado: contabilidad
 * revalida al aprobar.
 */
export default function AdjustmentMarginPreview({
  projection,
  currencySymbol,
  changeCount,
  subtitle = "Estimado · se revalida al aprobar",
}: Props) {
  const { amountBefore, pctBefore, amountAfter, pctAfter, amountDelta, pctDelta } =
    projection;

  const hasChanges = changeCount > 0 && Math.abs(amountDelta) > 0.004;
  const positive = amountDelta > 0.004;
  const negative = amountDelta < -0.004;

  const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  const accent = positive
    ? "text-emerald-600 dark:text-emerald-400"
    : negative
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  return (
    <div className="rounded-2xl bg-card shadow-md p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-muted",
              hasChanges && accent,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">
              Impacto en el margen
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              {subtitle}
            </p>
          </div>
        </div>
        {hasChanges && (
          <div className={cn("text-right", accent)}>
            <p className="text-lg font-bold leading-tight">
              {positive ? "+" : ""}
              {currencySymbol}{" "}
              <NumberFormat value={amountDelta.toFixed(2)} />
            </p>
            <p className="text-xs font-medium leading-tight">
              {pctDelta > 0 ? "+" : ""}
              <NumberFormat value={pctDelta.toFixed(2)} />% pts
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-muted/50 px-3 py-2.5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Actual
          </p>
          <p className="text-sm font-semibold">
            {currencySymbol} <NumberFormat value={amountBefore.toFixed(2)} />
          </p>
          <p className="text-xs text-muted-foreground">
            <NumberFormat value={pctBefore.toFixed(2)} />%
          </p>
        </div>

        <div className="flex items-center justify-center">
          <span
            className={cn(
              "text-xs font-medium",
              hasChanges ? accent : "text-muted-foreground/50",
            )}
          >
            →
          </span>
        </div>

        <div
          className={cn(
            "rounded-xl px-3 py-2.5 transition-colors",
            hasChanges ? "bg-primary/10" : "bg-muted/50",
          )}
        >
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Proyectado
          </p>
          <p className={cn("text-sm font-semibold", hasChanges && accent)}>
            {currencySymbol} <NumberFormat value={amountAfter.toFixed(2)} />
          </p>
          <p className="text-xs text-muted-foreground">
            <NumberFormat value={pctAfter.toFixed(2)} />%
          </p>
        </div>
      </div>

      {!hasChanges && (
        <p className="mt-3 text-xs text-muted-foreground">
          Agrega o modifica bonos, descuentos u obsequios para ver cómo cambia el
          margen.
        </p>
      )}
    </div>
  );
}
