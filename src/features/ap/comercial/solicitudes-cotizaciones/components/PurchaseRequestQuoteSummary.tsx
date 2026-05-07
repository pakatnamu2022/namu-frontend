import { UseFormReturn } from "react-hook-form";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { FileCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { CustomersResource } from "../../clientes/lib/customers.interface";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import { VehicleResourceWithCosts } from "../../vehiculos/lib/vehicles.interface";
import { CurrencyTypesResource } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.interface";
import { VehicleColorResource } from "@/features/ap/configuraciones/vehiculos/colores-vehiculo/lib/vehicleColor.interface";
import { useState } from "react";

interface BonusDiscountRow {
  id: string;
  concept_id: string;
  descripcion: string;
  isPercentage: boolean;
  valor: number;
  isNegative: boolean;
}

interface PurchaseRequestQuoteSummaryProps {
  form: UseFormReturn<any>;
  mode: "create" | "update";
  isSubmitting: boolean;
  selectedHolder?: CustomersResource;
  modelsVn: ModelsVnResource[];
  vehiclesVn: VehicleResourceWithCosts[];
  vehicleColors: VehicleColorResource[];
  withVinWatch: boolean | undefined;
  vehicleVnWatch: string | undefined;
  modelVnWatch: string | undefined;
  vehicleColorWatch: string | undefined;
  selectedModel: ModelsVnResource | undefined;
  vehicleCurrency: {
    currencyId: number;
    symbol: string;
  };
  totals: {
    salePrice: number;
    bonusDiscountTotal: number;
    accessoriesTotal: number;
    negativeDiscounts: number;
    subtotal: number;
    vehicleCurrencyId: number;
  };
  finalTotal: number;
  invoiceCurrencyId: string;
  selectedInvoiceCurrency: CurrencyTypesResource | undefined;
  getExchangeRate: (currencyId: number) => number;
  currencyTypes: CurrencyTypesResource[];
  billedCost?: number;
  bonusDiscountRows?: BonusDiscountRow[];
  onCancel: () => void;
  onSubmit: (data: any) => void;
}

export function PurchaseRequestQuoteSummary({
  form,
  mode,
  isSubmitting,
  selectedHolder,
  modelsVn,
  vehiclesVn,
  vehicleColors,
  withVinWatch,
  vehicleVnWatch,
  modelVnWatch,
  vehicleColorWatch,
  selectedModel,
  vehicleCurrency,
  totals,
  finalTotal,
  selectedInvoiceCurrency,
  getExchangeRate,
  billedCost = 0,
  bonusDiscountRows = [],
  onCancel,
  onSubmit,
}: PurchaseRequestQuoteSummaryProps) {
  const { data: allCurrencyTypes = [] } = useAllCurrencyTypes();
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);

  // Obtener el color seleccionado
  const selectedColor = vehicleColorWatch
    ? vehicleColors.find((c) => c.id.toString() === vehicleColorWatch)
    : undefined;

  const fmt = (n: number) =>
    n.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Calcular bonos y descuentos directamente desde las filas (evita bug de orden en calculateTotals)
  const rowAmount = (row: BonusDiscountRow) =>
    row.isPercentage ? (totals.salePrice * row.valor) / 100 : row.valor;

  const bonusRows = bonusDiscountRows.filter((r) => !r.isNegative);
  const discountRows = bonusDiscountRows.filter((r) => r.isNegative);

  const bonusTotal = bonusRows.reduce((sum, r) => sum + rowAmount(r), 0);
  const discountTotal = discountRows.reduce((sum, r) => sum + rowAmount(r), 0);

  // Margen real:
  //   Ingresos del cliente  = precio venta - descuentos al cliente + accesorios cobrados
  //   Ingresos de la marca  = bonos de marca
  //   Costo                 = costo de compra del vehículo
  const hasMarginData = withVinWatch && billedCost > 0 && totals.salePrice > 0;
  const clientRevenue = totals.salePrice - discountTotal + totals.accessoriesTotal;
  const totalIncome = clientRevenue + bonusTotal;
  const realMarginAmount = hasMarginData ? totalIncome - billedCost : 0;
  const realMarginPct = hasMarginData ? (realMarginAmount / billedCost) * 100 : 0;

  const marginButtonColor = !hasMarginData
    ? ""
    : realMarginPct >= 4
      ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
      : realMarginPct >= 0
        ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
        : "bg-red-600 hover:bg-red-700 text-white border-red-600";

  return (
    <div className="lg:col-span-1 lg:row-start-1 lg:col-start-3 h-full">
      <Card className="h-full sticky top-6 bg-linear-to-br from-primary/5 via-background to-muted/20 border-primary/20">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="size-5 text-primary" />
              Resumen
            </CardTitle>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30"
            >
              {mode === "update" ? "Edición" : "Nuevo"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {form.watch("type_document") === "COTIZACION"
              ? "Cotización"
              : "Solicitud de Compra"}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Información del Vehículo */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">
              {withVinWatch ? "Vehículo" : "Modelo y Color"}
            </p>
            <p className="text-sm font-semibold">
              {withVinWatch && vehicleVnWatch
                ? vehiclesVn.find((v) => v.id === Number(vehicleVnWatch))
                    ?.vin || "Sin seleccionar"
                : modelVnWatch
                  ? modelsVn.find((m) => m.id === Number(modelVnWatch))
                      ?.version || "Sin seleccionar"
                  : "Sin seleccionar"}
            </p>
            {selectedModel && !withVinWatch && (
              <p className="text-xs text-muted-foreground">
                {selectedModel.code} - {selectedModel.version}
              </p>
            )}
            {selectedModel && withVinWatch && (
              <p className="text-xs text-muted-foreground">
                {selectedModel.code} - {selectedModel.version}
              </p>
            )}
            {!withVinWatch && selectedColor && (
              <p className="text-xs text-muted-foreground">
                Color: {selectedColor.description}
              </p>
            )}
          </div>

          {/* Cliente/Titular */}
          <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
            <p className="text-xs font-medium text-muted-foreground">Titular</p>
            <p className="text-sm font-semibold">
              {selectedHolder?.full_name || "Sin seleccionar"}
            </p>
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Desglose de Precios */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Desglose
            </p>
            <div className="space-y-2 p-3 rounded-lg bg-background/50 border border-muted-foreground/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Precio de Venta</span>
                <span className="font-medium">
                  {vehicleCurrency.symbol}{" "}
                  {totals.salePrice.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {totals.bonusDiscountTotal > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Bonos/Desc. (info)
                  </span>
                  <span className="font-medium text-muted-foreground/60">
                    {vehicleCurrency.symbol}{" "}
                    {totals.bonusDiscountTotal.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {totals.negativeDiscounts > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Descuentos</span>
                  <span className="font-medium text-red-600">
                    - {vehicleCurrency.symbol}{" "}
                    {totals.negativeDiscounts.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {totals.accessoriesTotal > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Accesorios</span>
                  <span className="font-medium text-primary">
                    + {vehicleCurrency.symbol}{" "}
                    {totals.accessoriesTotal.toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator className="bg-primary/20" />

          {/* Subtotal en moneda del vehículo */}
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-muted-foreground/20">
            <span className="text-sm font-semibold">Subtotal</span>
            <span className="text-base font-bold">
              {vehicleCurrency.symbol}{" "}
              {totals.subtotal.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Tipos de Cambio */}
          {allCurrencyTypes.filter((c) => c.id !== vehicleCurrency.currencyId)
            .length > 0 && (
            <div className="space-y-1 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Tipos de Cambio
              </p>
              {allCurrencyTypes
                .filter((c) => c.id !== vehicleCurrency.currencyId)
                .map((c) => {
                  const vehicleRate = getExchangeRate(vehicleCurrency.currencyId);
                  const otherRate = getExchangeRate(c.id);
                  // TC: cuántas unidades de c por 1 unidad de moneda vehículo
                  const tc = vehicleRate / otherRate;
                  return (
                    <div
                      key={c.id}
                      className="flex justify-between items-center text-xs"
                    >
                      <span className="text-muted-foreground">
                        1 {vehicleCurrency.symbol} = {c.symbol}
                      </span>
                      <span className="font-medium tabular-nums">
                        {tc.toFixed(3)}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}

          <Separator className="bg-muted-foreground/20" />

          {/* Total a Facturar */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-primary">
                Total a Facturar
              </span>
              <span className="text-xl font-bold text-primary">
                {selectedInvoiceCurrency?.symbol || vehicleCurrency.symbol}{" "}
                {finalTotal.toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Botón Margen Real */}
          {hasMarginData && (
            <Button
              type="button"
              variant="outline"
              className={`w-full font-semibold ${marginButtonColor}`}
              onClick={() => setIsMarginModalOpen(true)}
            >
              <TrendingUp className="size-4 mr-2" />
              Ver Margen ({realMarginPct >= 0 ? "+" : ""}
              {realMarginPct.toFixed(2)}%)
            </Button>
          )}

          <Separator className="bg-muted-foreground/20" />

          {/* Comentarios */}
          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentarios/Notas</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Agregue cualquier comentario adicional..."
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botones de Acción */}
          <div className="space-y-2 pt-4">
            <ConfirmationDialog
              trigger={
                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  <FileCheck className="size-4 mr-2" />
                  {isSubmitting
                    ? "Guardando..."
                    : mode === "update"
                      ? "Actualizar"
                      : "Guardar"}
                </Button>
              }
              title={
                mode === "update"
                  ? form.watch("type_document") === "COTIZACION"
                    ? "¿Actualizar cotización?"
                    : "¿Actualizar solicitud de compra?"
                  : form.watch("type_document") === "COTIZACION"
                    ? "¿Guardar cotización?"
                    : "¿Guardar solicitud de compra?"
              }
              description={
                mode === "update"
                  ? "Se actualizarán los datos en el sistema. ¿Deseas continuar?"
                  : "Se creará un nuevo registro con los datos ingresados. ¿Deseas continuar?"
              }
              confirmText={mode === "update" ? "Sí, actualizar" : "Sí, guardar"}
              cancelText="Cancelar"
              variant="default"
              icon="info"
              onConfirm={() => form.handleSubmit(onSubmit)()}
              confirmDisabled={isSubmitting || !form.formState.isValid}
            />
            <ConfirmationDialog
              trigger={
                <Button type="button" variant="outline" className="w-full">
                  Cancelar
                </Button>
              }
              title="¿Cancelar registro?"
              description="Se perderán todos los datos ingresados en el formulario. ¿Estás seguro de que deseas cancelar?"
              confirmText="Sí, cancelar"
              cancelText="No, continuar"
              variant="destructive"
              icon="warning"
              onConfirm={onCancel}
            />
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalle de Margen */}
      <Dialog open={isMarginModalOpen} onOpenChange={setIsMarginModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Detalle del Margen Real
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-1">
            {/* ── INGRESOS ── */}
            <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ingresos
              </p>

              {/* Precio de venta base */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Precio de Venta</span>
                <span className="font-medium">
                  {vehicleCurrency.symbol} {fmt(totals.salePrice)}
                </span>
              </div>

              {/* Descuentos al cliente (reducen lo que cobra el dealer) */}
              {discountRows.map((row) => (
                <div
                  key={row.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-muted-foreground truncate max-w-[210px]">
                    Desc. {row.descripcion}
                    {row.isPercentage && ` (${row.valor}%)`}
                  </span>
                  <span className="font-medium text-red-600">
                    − {vehicleCurrency.symbol} {fmt(rowAmount(row))}
                  </span>
                </div>
              ))}

              {/* Accesorios cobrados al cliente */}
              {totals.accessoriesTotal > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Accesorios</span>
                  <span className="font-medium text-primary">
                    + {vehicleCurrency.symbol} {fmt(totals.accessoriesTotal)}
                  </span>
                </div>
              )}

              <Separator className="my-1" />

              {/* Subtotal del cliente */}
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Subtotal (cliente)</span>
                <span>{vehicleCurrency.symbol} {fmt(clientRevenue)}</span>
              </div>

              {/* Bonos de marca (ingreso adicional del dealer, no del cliente) */}
              {bonusRows.length > 0 && (
                <>
                  <Separator className="my-1" />
                  <p className="text-xs text-muted-foreground">Bonos de marca</p>
                  {bonusRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-muted-foreground truncate max-w-[210px]">
                        {row.descripcion}
                        {row.isPercentage && ` (${row.valor}%)`}
                      </span>
                      <span className="font-medium text-green-600">
                        + {vehicleCurrency.symbol} {fmt(rowAmount(row))}
                      </span>
                    </div>
                  ))}
                </>
              )}

              <Separator className="my-1" />

              {/* Total ingresos */}
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Total Ingresos</span>
                <span>{vehicleCurrency.symbol} {fmt(totalIncome)}</span>
              </div>
            </div>

            {/* ── COSTOS ── */}
            <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Costos
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Costo de Compra</span>
                <span className="font-medium text-red-600">
                  − {vehicleCurrency.symbol} {fmt(billedCost)}
                </span>
              </div>
            </div>

            {/* ── MARGEN REAL ── */}
            <div
              className={`p-3 rounded-lg border flex justify-between items-center ${
                realMarginPct >= 4
                  ? "bg-green-50 border-green-300 text-green-700"
                  : realMarginPct >= 0
                    ? "bg-orange-50 border-orange-300 text-orange-700"
                    : "bg-red-50 border-red-300 text-red-700"
              }`}
            >
              <span className="text-base font-bold">Margen Real</span>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {vehicleCurrency.symbol} {fmt(realMarginAmount)}
                </p>
                <p className="text-sm font-semibold">
                  ({realMarginPct >= 0 ? "+" : ""}
                  {realMarginPct.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
