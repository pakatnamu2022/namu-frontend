import { UseFormReturn } from "react-hook-form";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { OthersRow } from "./OthersTable";
import { FileCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
import { ApprovedAccesoriesResource } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.interface";
import { useState } from "react";
import { warningToast } from "@/core/core.function";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface BonusDiscountRow {
  id: string;
  concept_id: string;
  descripcion: string;
  isPercentage: boolean;
  valor: number;
  isNegative: boolean;
}

interface AccessoryRow {
  id: string;
  accessory_id: number;
  quantity: number;
  type: string;
  additional_price?: number;
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
  accessoriesRows?: AccessoryRow[];
  othersRows?: OthersRow[];
  approvedAccesories?: ApprovedAccesoriesResource[];
  canManage?: boolean;
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
  currencyTypes,
  billedCost = 0,
  bonusDiscountRows = [],
  accessoriesRows = [],
  othersRows = [],
  approvedAccesories = [],
  canManage = false,
  onCancel,
  onSubmit,
}: PurchaseRequestQuoteSummaryProps) {
  const { data: allCurrencyTypes = [] } = useAllCurrencyTypes();
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [simulationAdj, setSimulationAdj] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const getValidationErrors = (errors: Record<string, any>): string[] => {
    const messages: string[] = [];
    const traverse = (obj: any) => {
      if (!obj) return;
      if (typeof obj.message === "string") { messages.push(obj.message); return; }
      Object.values(obj).forEach((v) => traverse(v));
    };
    traverse(errors);
    return messages;
  };

  const handleSaveClick = async () => {
    const valid = await form.trigger();
    if (!valid) {
      const msgs = getValidationErrors(form.formState.errors);
      const description =
        msgs.length === 0
          ? "Completa todos los campos obligatorios."
          : msgs.length === 1
            ? msgs[0]
            : `${msgs[0]} (+${msgs.length - 1} más)`;
      warningToast("Campos requeridos incompletos", description);
      return;
    }
    setIsConfirmOpen(true);
  };

  // Obtener el color seleccionado
  const selectedColor = vehicleColorWatch
    ? vehicleColors.find((c) => c.id.toString() === vehicleColorWatch)
    : undefined;

  const fmt = (n: number) =>
    n.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // IDs de moneda para conversión de accesorios
  const solesId = currencyTypes.find((c) => c.code === "PEN")?.id ?? 3;
  const usdId = currencyTypes.find((c) => c.code === "USD")?.id ?? 1;

  const accCurrencyId = (acc: ApprovedAccesoriesResource) =>
    acc.type_operation_id === CM_COMERCIAL_ID ? usdId : solesId;

  const convertToVehicleCurrency = (amount: number, fromId: number) => {
    if (fromId === totals.vehicleCurrencyId) return amount;
    const from = getExchangeRate(fromId);
    const to = getExchangeRate(totals.vehicleCurrencyId);
    return (amount * from) / to;
  };

  // Detalle completo de accesorios para el modal
  const accessoryDetails = accessoriesRows
    .map((row) => {
      const acc = approvedAccesories.find((a) => a.id === row.accessory_id);
      if (!acc) return null;
      const unitPrice = Number(acc.price) + (row.additional_price ?? 0);
      const rawTotal = unitPrice * row.quantity;
      const converted = convertToVehicleCurrency(rawTotal, accCurrencyId(acc));
      return {
        id: row.id,
        name: acc.description,
        quantity: row.quantity,
        unitPrice,
        total: converted,
        isGift: row.type === "OBSEQUIO",
        symbol: acc.currency_symbol ?? vehicleCurrency.symbol,
        originalCurrencyId: accCurrencyId(acc),
      };
    })
    .filter(Boolean) as {
      id: string;
      name: string;
      quantity: number;
      unitPrice: number;
      total: number;
      isGift: boolean;
      symbol: string;
      originalCurrencyId: number;
    }[];

  const paidAccessories = accessoryDetails.filter((a) => !a.isGift);
  const giftAccessories = accessoryDetails.filter((a) => a.isGift);
  const giftTotal = giftAccessories.reduce((s, a) => s + a.total, 0);

  // Calcular bonos y descuentos directamente desde las filas (evita bug de orden en calculateTotals)
  const rowAmount = (row: BonusDiscountRow) =>
    row.isPercentage ? (totals.salePrice * row.valor) / 100 : row.valor;

  const bonusRows = bonusDiscountRows.filter((r) => !r.isNegative);
  const discountRows = bonusDiscountRows.filter((r) => r.isNegative);

  const bonusTotal = bonusRows.reduce((sum, r) => sum + rowAmount(r), 0);
  const discountTotal = discountRows.reduce((sum, r) => sum + rowAmount(r), 0);
  const paidAccTotal = paidAccessories.reduce((s, a) => s + a.total, 0);

  // Margen real:
  //   Ingresos del cliente  = precio venta - descuentos al cliente + accesorios cobrados
  //   Ingresos de la marca  = bonos de marca
  //   Costos                = costo de compra + obsequios
  const hasMarginData = withVinWatch && billedCost > 0 && totals.salePrice > 0;
  const clientRevenue = totals.salePrice - discountTotal + paidAccTotal;
  const totalIncome = clientRevenue + bonusTotal;
  const vehicleCosts = billedCost + giftTotal;
  const grossDiff = totalIncome - vehicleCosts;
  const netDiff = grossDiff / 1.18;
  const netSalePrice = totals.salePrice / 1.18;
  const othersNetTotal = othersRows.reduce((sum, row) => {
    const amt = row.type === "FIJO" ? row.value : (netSalePrice * row.value) / 100;
    return sum + amt;
  }, 0);
  const realMarginAmount = hasMarginData ? netDiff - othersNetTotal : 0;
  const realMarginPct = hasMarginData ? (realMarginAmount / netSalePrice) * 100 : 0;

  // Simulación hipotética
  const simAdj = parseFloat(simulationAdj) || 0;
  const simMarginAmount = realMarginAmount + simAdj;
  const simMarginPct = netSalePrice > 0 ? (simMarginAmount / netSalePrice) * 100 : 0;

  const marginColor = (pct: number) =>
    pct >= 4
      ? { btn: "bg-green-600 hover:bg-green-700 text-white border-green-600", badge: "bg-green-50 border-green-300 text-green-700" }
      : pct >= 0
        ? { btn: "bg-orange-500 hover:bg-orange-600 text-white border-orange-500", badge: "bg-orange-50 border-orange-300 text-orange-700" }
        : { btn: "bg-red-600 hover:bg-red-700 text-white border-red-600", badge: "bg-red-50 border-red-300 text-red-700" };

  const realColor = marginColor(realMarginPct);
  const simColor = marginColor(simMarginPct);

  const marginButtonColor = !hasMarginData ? "" : realColor.btn;

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

        <CardContent className="space-y-0">
          {/* Vehículo */}
          <div className="py-3">
            <p className="text-xs text-muted-foreground">
              {withVinWatch ? "Vehículo" : "Modelo"}
            </p>
            <p className="text-sm font-semibold mt-0.5 leading-tight">
              {withVinWatch && vehicleVnWatch
                ? vehiclesVn.find((v) => v.id === Number(vehicleVnWatch))?.vin || "Sin seleccionar"
                : modelVnWatch
                  ? modelsVn.find((m) => m.id === Number(modelVnWatch))?.version || "Sin seleccionar"
                  : "Sin seleccionar"}
            </p>
            {selectedModel && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedModel.code}
                {!withVinWatch && selectedColor && ` · ${selectedColor.description}`}
              </p>
            )}
          </div>

          <Separator />

          {/* Titular */}
          <div className="py-3">
            <p className="text-xs text-muted-foreground">Titular</p>
            <p className="text-sm font-semibold mt-0.5">
              {selectedHolder?.full_name || "Sin seleccionar"}
            </p>
          </div>

          <Separator />

          {/* Líneas de precio */}
          <div className="py-3 space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-mono uppercase text-xs">Precio Venta</span>
              <span className="font-medium tabular-nums">
                {vehicleCurrency.symbol} {fmt(totals.salePrice)}
              </span>
            </div>

            {totals.bonusDiscountTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-mono uppercase text-xs">Bonos/Desc.</span>
                <span className="font-medium text-muted-foreground/60 tabular-nums">
                  {vehicleCurrency.symbol} {fmt(totals.bonusDiscountTotal)}
                </span>
              </div>
            )}

            {totals.negativeDiscounts > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-mono uppercase text-xs">Descuentos</span>
                <span className="font-medium text-red-500 tabular-nums">
                  − {vehicleCurrency.symbol} {fmt(totals.negativeDiscounts)}
                </span>
              </div>
            )}

            {totals.accessoriesTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-mono uppercase text-xs">Accesorios</span>
                <span className="font-medium text-primary tabular-nums">
                  + {vehicleCurrency.symbol} {fmt(totals.accessoriesTotal)}
                </span>
              </div>
            )}

            {/* Tipos de cambio */}
            {allCurrencyTypes.filter((c) => c.id !== vehicleCurrency.currencyId).map((c) => {
              const tc = getExchangeRate(vehicleCurrency.currencyId) / getExchangeRate(c.id);
              return (
                <div key={c.id} className="flex justify-between items-center">
                  <span className="text-muted-foreground font-mono text-xs">
                    T.C. 1 {vehicleCurrency.symbol} = {c.symbol}
                  </span>
                  <span className="tabular-nums text-xs text-muted-foreground">{tc.toFixed(3)}</span>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Subtotal */}
          <div className="flex justify-between items-center py-3">
            <span className="font-mono uppercase text-xs font-semibold">Subtotal</span>
            <span className="font-semibold tabular-nums text-sm">
              {vehicleCurrency.symbol} {fmt(totals.subtotal)}
            </span>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center pt-4 pb-2">
            <span className="font-mono uppercase text-sm font-semibold text-blue-600 dark:text-blue-400">
              Total
            </span>
            <span className="text-2xl font-medium text-blue-600 dark:text-blue-400 tabular-nums">
              {selectedInvoiceCurrency?.symbol || vehicleCurrency.symbol}{" "}
              {fmt(finalTotal)}
            </span>
          </div>

          {/* Botón Margen Real */}
          {canManage && hasMarginData && (
            <>
              <Separator />
              <div className="py-3">
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
              </div>
            </>
          )}

          <Separator />

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
          <div className="space-y-2 pt-3">
            <Button
              type="button"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
              onClick={handleSaveClick}
            >
              <FileCheck className="size-4 mr-2" />
              {isSubmitting
                ? "Guardando..."
                : mode === "update"
                  ? "Actualizar"
                  : "Guardar"}
            </Button>
            <ConfirmationDialog
              open={isConfirmOpen}
              onOpenChange={setIsConfirmOpen}
              trigger={<span />}
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
              confirmDisabled={isSubmitting}
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
      <Dialog
        open={isMarginModalOpen}
        onOpenChange={(open) => {
          setIsMarginModalOpen(open);
          if (!open) setSimulationAdj("");
        }}
      >
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              Detalle del Margen Real
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-1">
            {/* ── INGRESOS ── */}
            <div className="space-y-1.5 p-3 rounded-lg bg-muted/30 border border-muted-foreground/10">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Ingresos
              </p>

              {/* Precio de venta base */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Precio de Venta</span>
                <span className="font-medium">
                  {vehicleCurrency.symbol} {fmt(totals.salePrice)}
                </span>
              </div>

              {/* Descuentos al cliente */}
              {discountRows.map((row) => (
                <div key={row.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate max-w-[210px]">
                    Desc. {row.descripcion}
                    {row.isPercentage && ` (${row.valor}%)`}
                  </span>
                  <span className="font-medium text-red-600">
                    − {vehicleCurrency.symbol} {fmt(rowAmount(row))}
                  </span>
                </div>
              ))}

              {/* Accesorios cobrados al cliente (uno por uno) */}
              {paidAccessories.map((acc) => (
                <div key={acc.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate max-w-[210px]">
                    {acc.name} × {acc.quantity}
                  </span>
                  <span className="font-medium text-primary">
                    + {vehicleCurrency.symbol} {fmt(acc.total)}
                  </span>
                </div>
              ))}

              <Separator className="my-1.5" />

              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Subtotal cliente</span>
                <span>{vehicleCurrency.symbol} {fmt(clientRevenue)}</span>
              </div>

              {/* Bonos de marca */}
              {bonusRows.length > 0 && (
                <>
                  <Separator className="my-1.5" />
                  <p className="text-xs text-muted-foreground font-medium">Bonos de marca</p>
                  {bonusRows.map((row) => (
                    <div key={row.id} className="flex justify-between items-center text-sm">
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

              <Separator className="my-1.5" />
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Total Ingresos</span>
                <span>{vehicleCurrency.symbol} {fmt(totalIncome)}</span>
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
                  − {vehicleCurrency.symbol} {fmt(billedCost)}
                </span>
              </div>

              {/* Obsequios (costo para el dealer) */}
              {giftAccessories.map((acc) => (
                <div key={acc.id} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate max-w-[210px]">
                    Obsequio: {acc.name} × {acc.quantity}
                  </span>
                  <span className="font-medium text-red-600">
                    − {vehicleCurrency.symbol} {fmt(acc.total)}
                  </span>
                </div>
              ))}

              {vehicleCosts !== billedCost && (
                <>
                  <Separator className="my-1.5" />
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>Total Costos</span>
                    <span className="text-red-600">
                      − {vehicleCurrency.symbol} {fmt(vehicleCosts)}
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
                <span className="text-muted-foreground">(Ingresos − Costos) ÷ 1.18</span>
                <span className="font-medium">{vehicleCurrency.symbol} {fmt(netDiff)}</span>
              </div>
              {othersRows.map((row) => {
                const amt = row.type === "FIJO" ? row.value : (netSalePrice * row.value) / 100;
                return (
                  <div key={row.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{row.description}</span>
                    <span className="font-medium text-red-600">− {vehicleCurrency.symbol} {fmt(amt)}</span>
                  </div>
                );
              })}
              <Separator className="my-1.5" />
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Utilidad Neta</span>
                <span className={realMarginAmount >= 0 ? "text-green-700" : "text-red-600"}>
                  {vehicleCurrency.symbol} {fmt(realMarginAmount)}
                </span>
              </div>
            </div>

            {/* ── MARGEN REAL ── */}
            <div className={`p-3 rounded-lg border ${realColor.badge}`}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Margen Comercial
              </p>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  <p>{vehicleCurrency.symbol} {fmt(realMarginAmount)}</p>
                  <p className="text-xs">÷ (PV {vehicleCurrency.symbol} {fmt(totals.salePrice)} ÷ 1.18)</p>
                </div>
                <p className="text-2xl font-bold">
                  {realMarginPct >= 0 ? "+" : ""}{realMarginPct.toFixed(2)}%
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
                  {vehicleCurrency.symbol}
                </span>
              </div>

              {simAdj !== 0 && (
                <div className={`mt-2 p-2 rounded-md border flex justify-between items-center text-sm ${simColor.badge}`}>
                  <span className="font-semibold">Margen simulado</span>
                  <div className="text-right">
                    <p className="font-bold">
                      {vehicleCurrency.symbol} {fmt(simMarginAmount)}
                    </p>
                    <p className="text-xs font-semibold">
                      ({simMarginPct >= 0 ? "+" : ""}{simMarginPct.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
