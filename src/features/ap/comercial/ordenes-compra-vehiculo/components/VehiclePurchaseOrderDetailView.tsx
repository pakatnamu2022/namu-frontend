"use client";

import { VehiclePurchaseOrderResource } from "../lib/vehiclePurchaseOrder.interface";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import {
  Car,
  FileText,
  Calculator,
  Package,
  Warehouse,
  Info,
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

interface VehiclePurchaseOrderDetailViewProps {
  purchaseOrder: VehiclePurchaseOrderResource;
}

export default function VehiclePurchaseOrderDetailView({
  purchaseOrder,
}: VehiclePurchaseOrderDetailViewProps) {
  const hasVehicle = !!purchaseOrder.vehicle;
  const hasItems = purchaseOrder.items && purchaseOrder.items.length > 0;

  return (
    <div className="space-y-6">
      {/* Información General */}
      <GroupFormSection
        title="Información General"
        icon={Info}
        cols={{ sm: 1, md: 2, lg: 3 }}
      >
        <div>
          <p className="text-xs text-muted-foreground">Estado</p>
          <div className="mt-1">
            {purchaseOrder.status ? (
              <Badge className="border-0">Válida</Badge>
            ) : (
              <Badge variant="secondary" className="border-0">
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
              "dd/MM/yyyy"
            )}
          </p>
        </div>
        {purchaseOrder.due_date && (
          <div>
            <p className="text-xs text-muted-foreground">Fecha Vencimiento</p>
            <p className="font-medium">
              {format(
                parse(purchaseOrder.due_date, "yyyy-MM-dd", new Date()),
                "dd/MM/yyyy"
              )}
            </p>
          </div>
        )}
      </GroupFormSection>

      {/* Información del Vehículo - Solo si existe */}
      {hasVehicle && purchaseOrder.vehicle && (
        <GroupFormSection
          title="Información del Vehículo"
          icon={Car}
          cols={{ sm: 1, md: 2, lg: 3 }}
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
              <p className="text-xs text-muted-foreground">Almacén Físico</p>
              <p className="font-medium">
                {purchaseOrder.vehicle.warehouse_name}
              </p>
            </div>
          )}
        </GroupFormSection>
      )}

      {/* Información de la Factura */}
      <GroupFormSection
        title="Información de la Factura"
        icon={FileText}
        cols={{ sm: 1, md: 2, lg: 3 }}
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
        <div>
          <p className="text-xs text-muted-foreground">Tipo de Pedido</p>
          <p className="font-medium">{purchaseOrder.supplier_order_type}</p>
        </div>
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
          cols={{ sm: 1 }}
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
                      <TableCell>{item.description}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat("es-PE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(itemPrice)}
                      </TableCell>
                      <TableCell>{itemQty}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {new Intl.NumberFormat("es-PE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(itemSubtotal)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.is_vehicle ? (
                          <Badge variant="default" className="text-xs">
                            Vehículo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Item
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

      {/* Resumen Financiero */}
      <GroupFormSection
        title="Resumen Financiero"
        icon={Calculator}
        cols={{ sm: 1, md: 2 }}
      >
        <div className="col-span-full space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">Subtotal:</span>
            <span className="font-medium">
              {purchaseOrder.currency_code}{" "}
              {new Intl.NumberFormat("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(purchaseOrder.subtotal))}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-sm text-muted-foreground">IGV:</span>
            <span className="font-medium">
              {purchaseOrder.currency_code}{" "}
              {new Intl.NumberFormat("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(purchaseOrder.igv))}
            </span>
          </div>

          {Number(purchaseOrder.isc) > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">ISC:</span>
              <span className="font-medium">
                {purchaseOrder.currency_code}{" "}
                {new Intl.NumberFormat("es-PE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Number(purchaseOrder.isc))}
              </span>
            </div>
          )}

          {Number(purchaseOrder.discount) > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Descuento:</span>
              <span className="font-medium text-destructive">
                - {purchaseOrder.currency_code}{" "}
                {new Intl.NumberFormat("es-PE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Number(purchaseOrder.discount))}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-3 bg-primary/5 px-3 rounded-md">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg text-primary">
              {purchaseOrder.currency_code}{" "}
              {new Intl.NumberFormat("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(Number(purchaseOrder.total))}
            </span>
          </div>
        </div>
      </GroupFormSection>

      {/* Información de Almacén */}
      <GroupFormSection
        title="Información de Almacén"
        icon={Warehouse}
        cols={{ sm: 1 }}
      >
        <div>
          <p className="text-xs text-muted-foreground">Almacén</p>
          <div className="flex gap-4">
            <p className="font-medium">{purchaseOrder.warehouse}</p>
            <Badge variant="default" className="h-6">
              {purchaseOrder.article_class?.description}
            </Badge>
          </div>
        </div>
      </GroupFormSection>
    </div>
  );
}
