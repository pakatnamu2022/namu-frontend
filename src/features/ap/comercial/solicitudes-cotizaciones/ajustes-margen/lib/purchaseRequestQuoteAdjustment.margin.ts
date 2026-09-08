/**
 * Estimación de margen en el front — espejo (deliberadamente no compartido) de
 * PurchaseRequestQuoteAdjustmentRequestService::simulateMargin() del backend.
 *
 * La fórmula real es lineal respecto a los tres totales que esta pantalla puede
 * mover: bonos, descuentos y obsequios. El resto (costo facturado, accesorios
 * pagados, fletes, otros) queda fijo. Por eso basta con acumular el "delta bruto"
 * (Σ ingresos − Σ costos, en soles con IGV) de cada línea y proyectarlo sobre el
 * margen actual:
 *
 *   margen_after  = margen_actual + deltaBruto / 1.18
 *   margen_%_after = margen_%_actual + deltaBruto / base_selling_price * 100
 */
export interface MarginProjectionInput {
  baseSellingPrice: number;
  currentMarginAmount: number;
  currentMarginPct: number;
}

export interface MarginProjection {
  amountBefore: number;
  pctBefore: number;
  amountAfter: number;
  pctAfter: number;
  amountDelta: number;
  pctDelta: number;
}

export function projectMargin(
  { baseSellingPrice, currentMarginAmount, currentMarginPct }: MarginProjectionInput,
  totalRawDelta: number,
): MarginProjection {
  const amountAfter = currentMarginAmount + totalRawDelta / 1.18;
  const pctAfter =
    baseSellingPrice > 0
      ? currentMarginPct + (totalRawDelta / baseSellingPrice) * 100
      : currentMarginPct;

  return {
    amountBefore: currentMarginAmount,
    pctBefore: currentMarginPct,
    amountAfter,
    pctAfter,
    amountDelta: amountAfter - currentMarginAmount,
    pctDelta: pctAfter - currentMarginPct,
  };
}

/** Precio homologado del bono/descuento (mismo criterio que computeAmounts del backend). */
export function couponPrecioUnitario(
  isPercentage: boolean,
  value: number,
  salePrice: number,
): number {
  return isPercentage ? (salePrice * value) / 100 : value;
}

/** Aporte de un bono/descuento al delta bruto (bono suma, descuento resta). */
export function couponRawContribution(
  isNegative: boolean,
  precioUnitario: number,
): number {
  return isNegative ? -precioUnitario : precioUnitario;
}

/** Total (costo) de un obsequio: cantidad × (precio unitario + precio adicional). */
export function giftTotal(
  quantity: number,
  unitPrice: number,
  additionalPrice: number,
): number {
  return Math.max(0, quantity) * (unitPrice + Math.max(0, additionalPrice));
}
