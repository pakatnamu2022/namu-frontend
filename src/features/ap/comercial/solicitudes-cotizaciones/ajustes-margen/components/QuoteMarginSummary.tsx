import { NumberFormat } from "@/shared/components/NumberFormat";
import { cn } from "@/lib/utils";
import { PurchaseRequestQuoteResource } from "../../lib/purchaseRequestQuote.interface";

interface Props {
  quote: PurchaseRequestQuoteResource;
  /** "grid" para ancho completo; "list" para el panel lateral (fila label/valor). */
  layout?: "grid" | "list";
}

/**
 * Resumen informativo (solo lectura) de cómo se arma el margen de la
 * cotización: precio de venta, bonos/descuentos vigentes, accesorios y
 * otros costos. Se muestra en las vistas de ajuste de margen para dar
 * contexto — desde ahí solo pueden modificarse los bonos/descuentos y
 * obsequios, el resto de componentes es referencial.
 */
export default function QuoteMarginSummary({ quote, layout = "grid" }: Props) {
  const currencySymbol = quote.doc_type_currency_symbol || "S/";

  const bonuses = quote.bonus_discounts?.filter((b) => !b.is_negative) ?? [];
  const discounts = quote.bonus_discounts?.filter((b) => b.is_negative) ?? [];
  const bonusTotal = bonuses.reduce((sum, b) => sum + Number(b.amount), 0);
  const discountTotal = discounts.reduce((sum, b) => sum + Number(b.amount), 0);

  const paidAccessories =
    quote.accessories?.filter((a) => a.type !== "OBSEQUIO") ?? [];
  const giftAccessories =
    quote.accessories?.filter((a) => a.type === "OBSEQUIO") ?? [];
  const paidAccessoriesTotal = paidAccessories.reduce(
    (sum, a) => sum + Number(a.total),
    0,
  );
  const giftAccessoriesTotal = giftAccessories.reduce(
    (sum, a) => sum + Number(a.total),
    0,
  );

  const othersTotal =
    quote.others?.reduce((sum, o) => sum + Number(o.amount), 0) ?? 0;

  const marginAmount = Number(quote.margin_amount) || 0;
  const marginPct = Number(quote.margin_pct) || 0;

  const rows: { label: string; value: number; tone?: "bonus" | "discount" }[] = [
    { label: "Precio de Venta", value: Number(quote.sale_price) || 0 },
    { label: "Bonos vigentes", value: bonusTotal, tone: "bonus" },
    { label: "Descuentos vigentes", value: discountTotal, tone: "discount" },
    { label: "Accesorios pagados", value: paidAccessoriesTotal },
    { label: "Accesorios obsequio", value: giftAccessoriesTotal },
    { label: "Otros costos", value: othersTotal },
  ];

  const toneClass = (tone?: "bonus" | "discount") =>
    cn(
      tone === "bonus" && "text-emerald-600 dark:text-emerald-400",
      tone === "discount" && "text-red-600 dark:text-red-400",
    );

  return (
    <div className="rounded-2xl bg-card shadow-md p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold leading-tight">
            Cómo se arma el margen
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            {quote.ap_model_vn || "—"}
            {quote.ap_vehicle?.vin ? ` · VIN ${quote.ap_vehicle.vin}` : ""}
          </p>
        </div>
        <div className="rounded-xl bg-primary/10 px-3 py-2 text-right">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Margen actual
          </p>
          <p className="text-base font-bold text-primary">
            {currencySymbol} <NumberFormat value={marginAmount.toFixed(2)} />{" "}
            <span className="text-xs font-medium">
              (<NumberFormat value={marginPct.toFixed(2)} />%)
            </span>
          </p>
        </div>
      </div>

      {layout === "list" ? (
        <div className="divide-y divide-muted">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between py-1.5 text-sm"
            >
              <span className="text-muted-foreground">{r.label}</span>
              <span className={cn("font-medium", toneClass(r.tone))}>
                {currencySymbol} <NumberFormat value={r.value.toFixed(2)} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {rows.map((r) => (
            <div key={r.label} className="rounded-xl bg-muted/40 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {r.label}
              </p>
              <p className={cn("text-sm font-semibold", toneClass(r.tone))}>
                {currencySymbol} <NumberFormat value={r.value.toFixed(2)} />
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
