import { NumberFormat } from "@/shared/components/NumberFormat";
import { PurchaseRequestQuoteResource } from "../../lib/purchaseRequestQuote.interface";

interface Props {
  quote: PurchaseRequestQuoteResource;
}

/**
 * Resumen informativo (solo lectura) de cómo se arma el margen de la
 * cotización: precio de venta, bonos/descuentos vigentes, accesorios y
 * otros costos. Se muestra en las vistas de ajuste de margen para dar
 * contexto — desde ahí solo pueden modificarse los bonos/descuentos, el
 * resto de componentes es referencial.
 */
export default function QuoteMarginSummary({ quote }: Props) {
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

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Cómo se arma el margen</p>
        <span className="text-xs text-muted-foreground">
          Referencial — solo bonos/descuentos son editables aquí
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Vehículo</p>
          <p className="text-sm font-medium">{quote.ap_model_vn || "—"}</p>
          {quote.ap_vehicle?.vin && (
            <p className="text-xs text-muted-foreground">
              VIN {quote.ap_vehicle.vin}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Precio de Venta</p>
          <p className="text-sm font-medium">
            {currencySymbol} <NumberFormat value={Number(quote.sale_price).toFixed(2)} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Bonos vigentes</p>
          <p className="text-sm font-medium text-emerald-600">
            {currencySymbol} <NumberFormat value={bonusTotal.toFixed(2)} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Descuentos vigentes</p>
          <p className="text-sm font-medium text-red-600">
            {currencySymbol} <NumberFormat value={discountTotal.toFixed(2)} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Accesorios pagados</p>
          <p className="text-sm font-medium">
            {currencySymbol}{" "}
            <NumberFormat value={paidAccessoriesTotal.toFixed(2)} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Accesorios obsequio</p>
          <p className="text-sm font-medium">
            {currencySymbol}{" "}
            <NumberFormat value={giftAccessoriesTotal.toFixed(2)} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Otros costos</p>
          <p className="text-sm font-medium">
            {currencySymbol} <NumberFormat value={othersTotal.toFixed(2)} />
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Margen actual</p>
          <p className="text-sm font-semibold text-primary">
            {currencySymbol} <NumberFormat value={quote.margin_amount.toFixed(2)} />{" "}
            (<NumberFormat value={quote.margin_pct.toFixed(2)} />%)
          </p>
        </div>
      </div>
    </div>
  );
}
