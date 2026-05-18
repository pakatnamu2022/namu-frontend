"use client";

import { useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import BackButton from "@/shared/components/BackButton.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import {
  INVENTORY,
  translatePriceCalculationStep,
} from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import { usePriceCalculationDetails } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import { cn } from "@/lib/utils";
import type { PriceCalculationDetailsResponse } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.interface.ts";
import {
  ShoppingCart,
  BarChart2,
  Settings2,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Warehouse,
  Package,
  Calculator,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pen = (v: number) => `S/ ${v.toFixed(2)}`;

const stepIcons = [ShoppingCart, BarChart2, Settings2, TrendingUp, Tag];
const stepColors = [
  "bg-white border-gray-200 text-gray-800",
  "bg-white border-gray-200 text-gray-800",
  "bg-white border-gray-200 text-gray-800",
  "bg-white border-gray-200 text-gray-800",
  "bg-white border-gray-200 text-gray-800",
];
const stepIconBg = [
  "bg-gray-100 text-gray-600",
  "bg-gray-100 text-gray-600",
  "bg-gray-100 text-gray-600",
  "bg-gray-100 text-gray-600",
  "bg-gray-100 text-gray-600",
];
const stepNumberBg = [
  "bg-gray-700",
  "bg-gray-700",
  "bg-gray-700",
  "bg-gray-700",
  "bg-gray-700",
];

function DataRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-4 rounded-lg text-sm",
        highlight ? "bg-white/70 font-medium" : "bg-white/40",
      )}
    >
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-semibold">{value}</span>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PriceCalcSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function PriceCalcContent({ data }: { data: PriceCalculationDetailsResponse }) {
  const summary = data.summary;
  const steps = data.calculation_steps ?? [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            PVP calculado
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pen(summary.prices.calculated_pvp)}
          </p>
          <p className="mt-1 text-xs text-gray-500">{summary.currency}</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Costo promedio
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pen(summary.prices.average_cost)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Base de cálculo</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Precio mínimo
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pen(summary.prices.minimum_sale_price)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Desc. máx. {summary.configuration.minimum_discount_percent}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Última compra
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {pen(summary.prices.last_purchase_price)}
          </p>
          <p className="mt-1 text-xs text-gray-500">Costo unitario</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <Package className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
              Stock actual
            </p>
            <p className="text-base font-semibold text-gray-900">
              {summary.current_stock} unidades
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <Warehouse className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
              Almacén
            </p>
            <p className="truncate text-base font-semibold text-gray-900">
              {summary.warehouse_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              summary.prices.price_matches
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700",
            )}
          >
            {summary.prices.price_matches ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
              Estado del precio
            </p>
            <p className="text-base font-semibold text-gray-900">
              {summary.prices.price_matches
                ? "Precio sincronizado"
                : "Precio desincronizado"}
            </p>
            <p className="text-xs text-gray-500">
              PVP calculado vs. almacenado
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
          Pasos del cálculo
        </p>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {steps.map((step, i) => {
            const Icon = stepIcons[i] ?? TrendingUp;
            const colorClass = stepColors[i] ?? stepColors[0];
            const iconBgClass = stepIconBg[i] ?? stepIconBg[0];
            const numberBgClass = stepNumberBg[i] ?? stepNumberBg[0];

            return (
              <div
                key={step.step}
                className={cn("rounded-2xl border p-4 shadow-sm", colorClass)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
                      numberBgClass,
                    )}
                  >
                    {step.step}
                  </div>
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      iconBgClass,
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight text-gray-900">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-tight text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  {Object.entries(step.data).map(([key, val]) => {
                    if (val === null || val === undefined) return null;
                    if (typeof val === "object") return null;
                    const label = translatePriceCalculationStep(key);
                    const isPrice =
                      key.includes("cost") ||
                      key.includes("price") ||
                      key.includes("pvp") ||
                      key.includes("pen") ||
                      key.includes("minimum_sale");

                    const shouldFormatAsMoney =
                      isPrice && key !== "unit_cost_original";

                    const displayVal =
                      typeof val === "boolean"
                        ? val
                          ? "Sí"
                          : "No"
                        : shouldFormatAsMoney && typeof val === "number"
                          ? pen(val)
                          : String(val);
                    return (
                      <DataRow
                        key={key}
                        label={label}
                        value={displayVal}
                        highlight={isPrice}
                      />
                    );
                  })}
                </div>

                {step.formula && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                      Fórmula
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-800">
                      {step.formula}
                    </p>
                    {(() => {
                      const dev = step.development;
                      const details =
                        step.calculation_details ??
                        (step.step === 2 && dev
                          ? [
                              `Costo_Promedio = (${dev.stock_before_last_purchase} × ${dev.previous_average_cost} + ${dev.last_purchase_quantity} × ${dev.last_purchase_unit_cost}) / (${dev.stock_before_last_purchase} + ${dev.last_purchase_quantity})`,
                              `Costo_Promedio = (${(dev.stock_before_last_purchase as number) * (dev.previous_average_cost as number)} + ${(dev.last_purchase_quantity as number) * (dev.last_purchase_unit_cost as number)}) / ${dev.stock_after_purchase}`,
                              `Costo_Promedio = ${(dev.stock_before_last_purchase as number) * (dev.previous_average_cost as number) + (dev.last_purchase_quantity as number) * (dev.last_purchase_unit_cost as number)} / ${dev.stock_after_purchase}`,
                              `Costo_Promedio = ${dev.average_cost_after_purchase}`,
                            ].join("\n")
                          : null);
                      if (!details) return null;
                      return (
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Desarrollo
                          </p>
                          {details.split("\n").map((line, li) => (
                            <div
                              key={li}
                              className="flex items-center gap-2 font-mono text-sm text-gray-700"
                            >
                              {li > 0 && (
                                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              )}
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <p className="mt-4 border-t border-gray-200 pt-3 text-xs leading-relaxed text-gray-500">
                  {step.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-right text-xs text-gray-400">
        Generado el {data.generated_at}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PriceCalculationPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE } = INVENTORY;
  const params = useParams();

  const productId = parseInt(params.productId as string);
  const warehouseId = parseInt(params.warehouseId as string);

  const { data, isLoading } = usePriceCalculationDetails(
    productId,
    warehouseId,
    { enabled: !isNaN(productId) && !isNaN(warehouseId) },
  );

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  const productName = data?.summary?.product_name ?? `Producto #${productId}`;
  const productCode = data?.summary?.product_code ?? "";
  const backRoute = `/ap/post-venta/gestion-de-almacen/inventario/historico-compras/${productId}/${warehouseId}`;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Cálculo de Precio de Venta"
          subtitle={
            productCode ? `${productName} · ${productCode}` : productName
          }
          icon="Calculator"
        />
        <BackButton
          route={backRoute}
          name="Histórico de Compras"
          fullname={false}
        />
      </HeaderTableWrapper>

      {isLoading ? (
        <PriceCalcSkeleton />
      ) : data ? (
        <PriceCalcContent data={data} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
          <Calculator className="h-10 w-10" />
          <p className="text-sm">No se encontraron datos de cálculo.</p>
        </div>
      )}
    </div>
  );
}
