"use client";

import { VehiclePurchaseOrderResource } from "../lib/vehiclePurchaseOrder.interface";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import {
  Car,
  FileText,
  Package,
  Info,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

const fmt = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

interface VehiclePurchaseOrderDetailViewProps {
  purchaseOrder: VehiclePurchaseOrderResource;
}

export default function VehiclePurchaseOrderDetailView({
  purchaseOrder,
}: VehiclePurchaseOrderDetailViewProps) {
  const hasVehicle = !!purchaseOrder.vehicle;
  const hasItems = purchaseOrder.items && purchaseOrder.items.length > 0;
  const { quotation } = purchaseOrder;

  // Margin calculation
  let purchaseCost = 0;
  let normalizedSaleBase = 0;
  let normalizedSaleNet = 0;
  let marginCurrency = purchaseOrder.currency_code;

  if (quotation) {
    purchaseCost = Number(purchaseOrder.total);
    const saleBase = Number(quotation.base_selling_price);
    const saleNet = Number(quotation.sale_price);
    const exchangeRate = Number(quotation.exchange_rate) || 1;
    const sameCurrency =
      purchaseOrder.currency_code === quotation.type_currency;

    const normalize = (amount: number): number => {
      if (sameCurrency) return amount;
      if (
        purchaseOrder.currency_code === "USD" &&
        quotation.type_currency === "PEN"
      )
        return amount / exchangeRate;
      if (
        purchaseOrder.currency_code === "PEN" &&
        quotation.type_currency === "USD"
      )
        return amount * exchangeRate;
      return amount;
    };

    normalizedSaleBase = normalize(saleBase);
    normalizedSaleNet = normalize(saleNet);
  }

  const marginBase = normalizedSaleBase - purchaseCost;
  const marginNet = normalizedSaleNet - purchaseCost;
  const marginBasePct =
    purchaseCost > 0 ? (marginBase / purchaseCost) * 100 : 0;
  const marginNetPct = purchaseCost > 0 ? (marginNet / purchaseCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Información General */}
      <GroupFormSection
        title="Información General"
        color="gray"
        icon={Info}
        cols={{ sm: 1, md: 2, lg: 4 }}
      >
        <div>
          <p className="text-xs text-muted-foreground">Estado</p>
          <div className="mt-1">
            {purchaseOrder.status ? (
              <Badge className="border-0">Válida</Badge>
            ) : (
              <Badge color="secondary" className="border-0">
                Anulada
              </Badge>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Nro. Orden</p>
          <p className="font-medium">{purchaseOrder.number}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Nro. Guía</p>
          <p className="font-medium">{purchaseOrder.number_guide || "-"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sede</p>
          <p className="font-medium">{purchaseOrder.sede}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Fecha Emisión</p>
          <p className="font-medium">
            {format(
              parse(purchaseOrder.emission_date, "yyyy-MM-dd", new Date()),
              "dd/MM/yyyy",
            )}
          </p>
        </div>
        {purchaseOrder.due_date && (
          <div>
            <p className="text-xs text-muted-foreground">Fecha Vencimiento</p>
            <p className="font-medium">
              {format(
                parse(purchaseOrder.due_date, "yyyy-MM-dd", new Date()),
                "dd/MM/yyyy",
              )}
            </p>
          </div>
        )}
      </GroupFormSection>

      {/* Información del Vehículo */}
      {hasVehicle && purchaseOrder.vehicle && (
        <GroupFormSection
          title="Información del Vehículo"
          icon={Car}
          cols={{ sm: 1, md: 2, lg: 4 }}
        >
          <div>
            <p className="text-xs text-muted-foreground">VIN</p>
            <p className="font-medium font-mono">{purchaseOrder.vehicle.vin}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Modelo</p>
            <p className="font-medium">{purchaseOrder.vehicle.model.version}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Código Modelo</p>
            <p className="font-medium">{purchaseOrder.vehicle.model.code}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Año</p>
            <p className="font-medium">{purchaseOrder.vehicle.year}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Color</p>
            <p className="font-medium">{purchaseOrder.vehicle.vehicle_color}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo de Motor</p>
            <p className="font-medium">{purchaseOrder.vehicle.engine_type}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Número de Motor</p>
            <p className="font-medium font-mono">
              {purchaseOrder.vehicle.engine_number}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado Vehículo</p>
            <Badge
              style={{
                backgroundColor:
                  purchaseOrder.vehicle.status_color || "#6b7280",
              }}
            >
              {purchaseOrder.vehicle.vehicle_status}
            </Badge>
          </div>
          {purchaseOrder.vehicle.warehouse_name && (
            <div>
              <p className="text-xs text-muted-foreground">Almacén Vehículo</p>
              <p className="font-medium">
                {purchaseOrder.vehicle.warehouse_name}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Almacén Compra</p>
            <div className="flex gap-4">
              <p className="font-medium">{purchaseOrder.warehouse}</p>
            </div>
            <Badge color="default" className="h-6">
              {purchaseOrder.article_class?.description}
            </Badge>
          </div>
        </GroupFormSection>
      )}

      {/* Información de la Factura */}
      <GroupFormSection
        title="Información de la Factura"
        icon={FileText}
        cols={{ sm: 1, md: 2, lg: 4 }}
      >
        <div>
          <p className="text-xs text-muted-foreground">Proveedor</p>
          <p className="font-medium">{purchaseOrder.supplier}</p>
          <p className="text-xs text-muted-foreground">
            RUC: {purchaseOrder.supplier_num_doc}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Serie Factura</p>
          <p className="font-medium font-mono">
            {purchaseOrder.invoice_series}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Número Factura</p>
          <p className="font-medium font-mono">
            {purchaseOrder.invoice_number}
          </p>
        </div>
        {hasVehicle && (
          <div>
            <p className="text-xs text-muted-foreground">Tipo de Pedido</p>
            <p className="font-medium">{purchaseOrder.supplier_order_type}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Moneda</p>
          <p className="font-medium">
            {purchaseOrder.currency} ({purchaseOrder.currency_code})
          </p>
        </div>
        {purchaseOrder.invoice_dynamics && (
          <div>
            <p className="text-xs text-muted-foreground">Factura Dynamics</p>
            <p className="font-medium font-mono">
              {purchaseOrder.invoice_dynamics}
            </p>
          </div>
        )}
        {purchaseOrder.receipt_dynamics && (
          <div>
            <p className="text-xs text-muted-foreground">Recibo Dynamics</p>
            <p className="font-medium font-mono">
              {purchaseOrder.receipt_dynamics}
            </p>
          </div>
        )}
        {purchaseOrder.credit_note_dynamics && (
          <div>
            <p className="text-xs text-muted-foreground">Nota de Crédito</p>
            <p className="font-medium font-mono">
              {purchaseOrder.credit_note_dynamics}
            </p>
          </div>
        )}
      </GroupFormSection>

      {/* Items de la Orden */}
      {hasItems && (
        <GroupFormSection
          title="Items de la Orden de Compra"
          icon={Package}
          cols={{ sm: 1, md: 2, lg: 4 }}
        >
          <div className="col-span-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead className="min-w-[180px]">
                    Unidad de Medida
                  </TableHead>
                  <TableHead className="min-w-[250px]">Descripción</TableHead>
                  <TableHead className="w-[140px]">Precio Unitario</TableHead>
                  <TableHead className="w-[100px]">Cantidad</TableHead>
                  <TableHead className="w-[140px]">Subtotal</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder.items?.map((item, index) => {
                  const itemPrice = Number(item.unit_price) || 0;
                  const itemQty = Number(item.quantity) || 0;
                  const itemSubtotal = itemPrice * itemQty;

                  return (
                    <TableRow key={item.id || index}>
                      <TableCell>
                        <span className="text-sm font-medium">{index + 1}</span>
                      </TableCell>
                      <TableCell>
                        {item.unit_measurement
                          ? `${item.unit_measurement.dyn_code} - ${item.unit_measurement.description}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {item.product_name || item.description}
                        {item.product_code || ""}
                      </TableCell>
                      <TableCell>{fmt(itemPrice)}</TableCell>
                      <TableCell>{itemQty}</TableCell>
                      <TableCell>
                        <span className="font-medium">{fmt(itemSubtotal)}</span>
                      </TableCell>
                      <TableCell>
                        {item.is_vehicle ? (
                          <Badge color="default" className="text-xs">
                            Vehículo
                          </Badge>
                        ) : (
                          <Badge color="secondary" className="text-xs">
                            Producto
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </GroupFormSection>
      )}

      {/* Cotización de Referencia */}
      {quotation && (
        <GroupFormSection
          title="Cotización de Referencia"
          color="blue"
          icon={ClipboardList}
          cols={{ sm: 1, md: 2, lg: 4 }}
        >
          <div>
            <p className="text-xs text-muted-foreground">Nro. Cotización</p>
            <p className="font-medium font-mono">{quotation.correlative}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Titular</p>
            <p className="font-medium">{quotation.holder}</p>
            <p className="text-xs text-muted-foreground">
              {quotation.holder_document_number}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Asesor</p>
            <p className="font-medium">{quotation.advisor_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Modelo</p>
            <p className="font-medium">{quotation.ap_model_vn}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Color</p>
            <p className="font-medium">{quotation.vehicle_color}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Moneda Cotización</p>
            <p className="font-medium">
              {quotation.type_currency} / T.C. {quotation.exchange_rate}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio Base</p>
            <p className="font-medium font-mono">
              {quotation.type_currency_symbol}{" "}
              {fmt(Number(quotation.base_selling_price))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio de Venta</p>
            <p className="font-medium font-mono">
              {quotation.type_currency_symbol}{" "}
              {fmt(Number(quotation.sale_price))}
            </p>
            <p className="text-xs text-muted-foreground">
              {quotation.doc_type_currency_symbol}{" "}
              {fmt(Number(quotation.doc_sale_price))}
            </p>
          </div>
          <div className="col-span-full">
            <p className="text-xs text-muted-foreground">Estado</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {!!quotation.is_approved ? (
                <Badge className="border-0 text-xs">Aprobada</Badge>
              ) : (
                <Badge color="secondary" className="border-0 text-xs">
                  Sin aprobar
                </Badge>
              )}
              {!!quotation.is_invoiced && (
                <Badge color="default" className="border-0 text-xs">
                  Facturada
                </Badge>
              )}
              {quotation.is_paid && (
                <Badge color="default" className="border-0 text-xs">
                  Pagada
                </Badge>
              )}
            </div>
          </div>
          {quotation.warranty_years > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Garantía</p>
              <p className="font-medium">
                {quotation.warranty_years} año(s) / {quotation.warranty_km} km
              </p>
            </div>
          )}
        </GroupFormSection>
      )}

      {/* Análisis de Margen */}
      {quotation && (
        <GroupFormSection
          title="Análisis de Margen Máximo"
          color="emerald"
          icon={TrendingUp}
          cols={{ sm: 1 }}
        >
          <div className="col-span-full overflow-x-auto">
            <Table className="text-sm [&_td]:py-1.5 [&_th]:py-1.5">
              <TableHeader>
                <TableRow>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead className="text-right">Moneda</TableHead>
                  <TableHead className="text-right">Margen</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Costo de Compra
                    <span className="block text-xs text-muted-foreground/60">
                      {purchaseOrder.supplier}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {fmt(purchaseCost)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {purchaseOrder.currency_code}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>

                <TableRow>
                  <TableCell className="text-muted-foreground">
                    Precio Base Venta
                    <span className="block text-xs text-muted-foreground/60">
                      Sin descuentos de cotización
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {fmt(Number(quotation.base_selling_price))}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {quotation.type_currency}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono",
                      marginBase >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    {marginBase >= 0 ? "+" : ""}
                    {fmt(marginBase)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      marginBase >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    {marginBasePct >= 0 ? "+" : ""}
                    {marginBasePct.toFixed(2)}%
                  </TableCell>
                </TableRow>

                <TableRow className="border-t-2 font-semibold">
                  <TableCell>
                    Precio Neto Venta
                    <span className="block text-xs font-normal text-muted-foreground/60">
                      Con descuentos de cotización
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {fmt(Number(quotation.sale_price))}
                  </TableCell>
                  <TableCell className="text-right">
                    {quotation.type_currency}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-mono",
                      marginNet >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    {marginNet >= 0 ? "+" : ""}
                    {fmt(marginNet)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right",
                      marginNet >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  >
                    {marginNetPct >= 0 ? "+" : ""}
                    {marginNetPct.toFixed(2)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {purchaseOrder.currency_code !== quotation.type_currency && (
              <p className="text-xs text-muted-foreground mt-2 px-1">
                * Margen normalizado a {marginCurrency} · T.C.{" "}
                {quotation.exchange_rate} ({quotation.type_currency}/
                {purchaseOrder.currency_code})
              </p>
            )}
          </div>
        </GroupFormSection>
      )}
    </div>
  );
}
