"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { GeneralModal } from "@/shared/components/GeneralModal";

export interface MarginBreakdownRow {
  id: string;
  label: string;
  amount: number;
  /** Solo para bonos/descuentos: muestra "(x%)" junto al label. */
  isPercentage?: boolean;
  valor?: number;
}

export interface MarginBreakdownAccessory {
  id: string;
  name: string;
  quantity: number;
  total: number;
}

export interface MarginBreakdownData {
  currencySymbol: string;
  salePrice: number;
  billedCost: number;
  discounts: MarginBreakdownRow[];
  bonuses: MarginBreakdownRow[];
  paidAccessories: MarginBreakdownAccessory[];
  giftAccessories: MarginBreakdownAccessory[];
  /** Otros costos internos (no flete). */
  extraCosts: MarginBreakdownRow[];
  /** Flete: se resta a nivel neto (después de ÷ 1.18). */
  fleteItems: MarginBreakdownRow[];
  clientRevenue: number;
  totalIncome: number;
  vehicleCosts: number;
  netDiff: number;
  netSalePrice: number;
  realMarginAmount: number;
  realMarginPct: number;
}

interface Props extends MarginBreakdownData {
  open: boolean;
  onClose: () => void;
}

const fmt = (n: number) =>
  n.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const marginColor = (pct: number) =>
  pct >= 4
    ? "bg-green-50 border-green-300 text-green-700"
    : pct >= 0
      ? "bg-orange-50 border-orange-300 text-orange-700"
      : "bg-red-50 border-red-300 text-red-700";

/**
 * Modal reutilizable con el desglose del Margen Comercial real de una
 * cotización / solicitud de compra: ingresos, costos, utilidad neta,
 * margen y un simulador de ajuste hipotético.
 */
export default function MarginBreakdownModal({
  open,
  onClose,
  currencySymbol,
  salePrice,
  billedCost,
  discounts,
  bonuses,
  paidAccessories,
  giftAccessories,
  extraCosts,
  fleteItems,
  clientRevenue,
  totalIncome,
  vehicleCosts,
  netDiff,
  netSalePrice,
  realMarginAmount,
  realMarginPct,
}: Props) {
  const [simulationAdj, setSimulationAdj] = useState("");

  const simAdj = parseFloat(simulationAdj) || 0;
  const simMarginAmount = realMarginAmount + simAdj;
  const simMarginPct =
    netSalePrice > 0 ? (simMarginAmount / netSalePrice) * 100 : 0;

  const handleClose = () => {
    setSimulationAdj("");
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Detalle del Margen Real"
      size="md"
      icon="TrendingUp"
    >
      <div className="space-y-3 pt-1">
        {/* ── INGRESOS ── */}
        <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Ingresos
          </p>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Precio de Venta</span>
            <span className="font-medium">
              {currencySymbol} {fmt(salePrice)}
            </span>
          </div>

          {discounts.map((row) => (
            <div
              key={row.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground truncate max-w-[210px]">
                Desc. {row.label}
                {row.isPercentage && ` (${row.valor}%)`}
              </span>
              <span className="font-medium text-red-600">
                − {currencySymbol} {fmt(row.amount)}
              </span>
            </div>
          ))}

          {paidAccessories.map((acc) => (
            <div
              key={acc.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground truncate max-w-[210px]">
                {acc.name} × {acc.quantity}
              </span>
              <span className="font-medium text-primary">
                + {currencySymbol} {fmt(acc.total)}
              </span>
            </div>
          ))}

          <Separator className="my-1.5" />

          <div className="flex justify-between items-center text-sm font-semibold">
            <span>Subtotal cliente</span>
            <span>
              {currencySymbol} {fmt(clientRevenue)}
            </span>
          </div>

          {bonuses.length > 0 && (
            <>
              <Separator className="my-1.5" />
              <p className="text-xs text-muted-foreground font-medium">
                Bonos de marca
              </p>
              {bonuses.map((row) => (
                <div
                  key={row.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-muted-foreground truncate max-w-[210px]">
                    {row.label}
                    {row.isPercentage && ` (${row.valor}%)`}
                  </span>
                  <span className="font-medium text-green-600">
                    + {currencySymbol} {fmt(row.amount)}
                  </span>
                </div>
              ))}
            </>
          )}

          <Separator className="my-1.5" />
          <div className="flex justify-between items-center text-sm font-bold">
            <span>Total Ingresos</span>
            <span>
              {currencySymbol} {fmt(totalIncome)}
            </span>
          </div>
        </div>

        {/* ── COSTOS ── */}
        <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Costos
          </p>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Costo de Compra</span>
            <span className="font-medium text-red-600">
              − {currencySymbol} {fmt(billedCost)}
            </span>
          </div>

          {giftAccessories.map((acc) => (
            <div
              key={acc.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground truncate max-w-[210px]">
                Obsequio: {acc.name} × {acc.quantity}
              </span>
              <span className="font-medium text-red-600">
                − {currencySymbol} {fmt(acc.total)}
              </span>
            </div>
          ))}

          {extraCosts.map((row) => (
            <div
              key={row.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground truncate max-w-[210px]">
                {row.label || "Costo interno"}
              </span>
              <span className="font-medium text-red-600">
                − {currencySymbol} {fmt(row.amount)}
              </span>
            </div>
          ))}

          {vehicleCosts !== billedCost && (
            <>
              <Separator className="my-1.5" />
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Total Costos</span>
                <span className="text-red-600">
                  − {currencySymbol} {fmt(vehicleCosts)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* ── UTILIDAD NETA ── */}
        <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Utilidad Neta
          </p>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">
              (Ingresos − Costos) ÷ 1.18
            </span>
            <span className="font-medium">
              {currencySymbol} {fmt(netDiff)}
            </span>
          </div>
          {fleteItems.map((row) => (
            <div
              key={row.id}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium text-red-600">
                − {currencySymbol} {fmt(row.amount)}
              </span>
            </div>
          ))}
          <Separator className="my-1.5" />
          <div className="flex justify-between items-center text-sm font-bold">
            <span>Utilidad Neta</span>
            <span
              className={
                realMarginAmount >= 0 ? "text-green-700" : "text-red-600"
              }
            >
              {currencySymbol} {fmt(realMarginAmount)}
            </span>
          </div>
        </div>

        {/* ── MARGEN REAL ── */}
        <div className={`p-3 rounded-lg border ${marginColor(realMarginPct)}`}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Margen Comercial
          </p>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <p>
                {currencySymbol} {fmt(realMarginAmount)}
              </p>
              <p className="text-xs">
                ÷ (PV {currencySymbol} {fmt(salePrice)} ÷ 1.18)
              </p>
            </div>
            <p className="text-2xl font-bold">
              {realMarginPct >= 0 ? "+" : ""}
              {realMarginPct.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* ── SIMULACIÓN ── */}
        <div className="space-y-2 p-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10">
          <p className="text-xs text-muted-foreground font-medium">
            Simular ajuste hipotético
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-4">±</span>
            <Input
              type="number"
              placeholder="0.00"
              value={simulationAdj}
              onChange={(e) => setSimulationAdj(e.target.value)}
              className="h-8 text-sm"
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {currencySymbol}
            </span>
          </div>

          {simAdj !== 0 && (
            <div
              className={`mt-2 p-2 rounded-md border flex justify-between items-center text-sm ${marginColor(simMarginPct)}`}
            >
              <span className="font-semibold">Margen simulado</span>
              <div className="text-right">
                <p className="font-bold">
                  {currencySymbol} {fmt(simMarginAmount)}
                </p>
                <p className="text-xs font-semibold">
                  ({simMarginPct >= 0 ? "+" : ""}
                  {simMarginPct.toFixed(2)}%)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GeneralModal>
  );
}
