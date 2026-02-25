"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";
import {
  FileText,
  User,
  Car,
  Calendar,
  MapPin,
  Package,
  MessageSquare,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PurchaseRequestQuoteDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PurchaseRequestQuoteResource;
}

export default function PurchaseRequestQuoteDetailModal({
  open,
  onOpenChange,
  quote,
}: PurchaseRequestQuoteDetailModalProps) {
  const hasBonusDiscounts =
    quote.bonus_discounts && quote.bonus_discounts.length > 0;
  const hasAccessories = quote.accessories && quote.accessories.length > 0;
  const model = quote.ap_vehicle?.model ?? quote.model;

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalle de Cotización"
      subtitle={`${quote.correlative} - ${quote.type_document}`}
      icon="FileText"
      side="right"
      size="5xl"
    >
      <div className="space-y-6">
        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 1, md: 2, xl: 3 }}
          headerExtra={
            <Badge
              color={quote.is_approved ? "default" : "secondary"}
              className={quote.is_approved ? "bg-primary" : "bg-secondary"}
            >
              {quote.is_approved ? "Aprobado" : "Pendiente"}
            </Badge>
          }
        >
          <div>
            <p className="text-xs text-muted-foreground">Correlativo</p>
            <p className="font-semibold">{quote.correlative}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo de Documento</p>
            <p className="font-medium">{quote.type_document}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              Fecha Límite
            </p>
            <p className="font-medium">
              {quote.quote_deadline
                ? new Date(quote.quote_deadline).toLocaleDateString("es-PE")
                : "No especificada"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3" />
              Sede
            </p>
            <p className="font-medium">{quote.sede || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Garantía</p>
            <p className="font-medium">{quote.warranty || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Asesor</p>
            <p className="font-medium">{quote.consultant?.name || "N/A"}</p>
          </div>

          {/* Información Financiera */}
          <div>
            <p className="text-xs text-muted-foreground">Moneda</p>
            <p className="font-medium">
              {quote.type_currency || quote.doc_type_currency}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo de Cambio</p>
            <p className="font-medium">{quote.exchange_rate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Moneda Facturado</p>
            <p className="font-medium">
              {quote.doc_type_currency} ({quote.doc_type_currency_symbol})
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio Base</p>
            <p className="font-semibold">
              <NumberFormat value={Number(quote.base_selling_price)} />
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Precio de Venta</p>
            <p className="font-semibold">
              <NumberFormat value={Number(quote.sale_price)} />
            </p>
          </div>
          <div className="col-span-full">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-primary">
                  Precio de Venta
                </span>
                <span className="text-lg font-bold text-primary">
                  {quote.doc_type_currency_symbol}{" "}
                  <NumberFormat value={quote.doc_sale_price} />
                </span>
              </div>
            </div>
          </div>
        </GroupFormSection>

        {/* Información del Titular/Cliente */}
        <GroupFormSection
          title="Información del Titular"
          icon={User}
          cols={{ sm: 1, md: 2, xl: 3 }}
        >
          <div>
            <p className="text-xs text-muted-foreground">Nombre Completo</p>
            <p className="font-semibold">{quote.holder}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-medium">{quote.client_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo de Documento</p>
            <p className="font-medium">
              {quote.holder_document_type === 1 ? "DNI" : "RUC"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Número de Documento</p>
            <p className="font-medium">{quote.holder_document_number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teléfono</p>
            <p className="font-medium">{quote.holder_phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium text-sm break-all">
              {quote.holder_email || "N/A"}
            </p>
          </div>
          <div className="col-span-full">
            <p className="text-xs text-muted-foreground">Dirección</p>
            <p className="font-medium text-sm">
              {quote.holder_address || "N/A"}
            </p>
          </div>
        </GroupFormSection>

        {/* Información del Vehículo */}
        <GroupFormSection
          title="Información del Vehículo"
          icon={Car}
          cols={{ sm: 1, md: 2, xl: 3 }}
        >
          <div>
            <p className="text-xs text-muted-foreground">Modelo</p>
            <p className="font-semibold">{quote.ap_model_vn || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Color</p>
            <p className="font-medium">{quote.vehicle_color || "N/A"}</p>
          </div>
          {quote.type_vehicle && (
            <div>
              <p className="text-xs text-muted-foreground">Tipo de Vehículo</p>
              <p className="font-medium">{quote.type_vehicle}</p>
            </div>
          )}

          {quote.ap_vehicle && (
            <div className="col-span-full space-y-4">
              {/* Identificación */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Identificación
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg border border-muted-foreground/10">
                  <div>
                    <p className="text-xs text-muted-foreground">VIN</p>
                    <p className="font-mono font-semibold text-sm">
                      {quote.ap_vehicle.vin || "N/A"}
                    </p>
                  </div>
                  {quote.ap_vehicle.plate && (
                    <div>
                      <p className="text-xs text-muted-foreground">Placa</p>
                      <p className="font-mono font-semibold text-sm">
                        {quote.ap_vehicle.plate}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Año</p>
                    <p className="font-medium text-sm">
                      {quote.ap_vehicle.year}
                    </p>
                  </div>
                  {quote.ap_vehicle.engine_number && (
                    <div>
                      <p className="text-xs text-muted-foreground">N° Motor</p>
                      <p className="font-mono font-medium text-sm">
                        {quote.ap_vehicle.engine_number}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">Color</p>
                    <p className="font-medium text-sm">
                      {quote.ap_vehicle.vehicle_color || "N/A"}
                    </p>
                  </div>
                  {quote.ap_vehicle.engine_type && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Tipo Motor
                      </p>
                      <p className="font-medium text-sm">
                        {quote.ap_vehicle.engine_type}
                      </p>
                    </div>
                  )}
                  {quote.ap_vehicle.vehicle_status && (
                    <div>
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: quote.ap_vehicle.status_color
                            ? `${quote.ap_vehicle.status_color}22`
                            : undefined,
                          color: quote.ap_vehicle.status_color || undefined,
                        }}
                      >
                        {quote.ap_vehicle.vehicle_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              {(quote.ap_vehicle.warehouse_name ||
                quote.ap_vehicle.warehouse_physical_name ||
                quote.ap_vehicle.sede_name_warehouse) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Ubicación
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg border border-muted-foreground/10">
                    {quote.ap_vehicle.sede_name_warehouse && (
                      <div>
                        <p className="text-xs text-muted-foreground">Sede</p>
                        <p className="font-medium text-sm">
                          {quote.ap_vehicle.sede_name_warehouse}
                        </p>
                      </div>
                    )}
                    {quote.ap_vehicle.warehouse_name && (
                      <div>
                        <p className="text-xs text-muted-foreground">Almacén</p>
                        <p className="font-medium text-sm">
                          {quote.ap_vehicle.warehouse_name}
                        </p>
                      </div>
                    )}
                    {quote.ap_vehicle.warehouse_physical_name && (
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Almacén Físico
                        </p>
                        <p className="font-medium text-sm">
                          {quote.ap_vehicle.warehouse_physical_name}
                        </p>
                      </div>
                    )}
                    {quote.ap_vehicle.sede_name_warehouse_physical &&
                      quote.ap_vehicle.sede_name_warehouse_physical !==
                        quote.ap_vehicle.sede_name_warehouse && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Sede (Físico)
                          </p>
                          <p className="font-medium text-sm">
                            {quote.ap_vehicle.sede_name_warehouse_physical}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Especificaciones del Modelo */}
          {model && (
            <div className="col-span-full space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Especificaciones del Modelo
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg border border-muted-foreground/10">
                {model.brand && (
                  <div>
                    <p className="text-xs text-muted-foreground">Marca</p>
                    <p className="font-medium text-sm">{model.brand}</p>
                  </div>
                )}
                {model.family && (
                  <div>
                    <p className="text-xs text-muted-foreground">Familia</p>
                    <p className="font-medium text-sm">{model.family}</p>
                  </div>
                )}
                {model.vehicle_type && (
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Tipo Vehículo
                    </p>
                    <p className="font-medium text-sm">{model.vehicle_type}</p>
                  </div>
                )}
                {model.body_type && (
                  <div>
                    <p className="text-xs text-muted-foreground">Carrocería</p>
                    <p className="font-medium text-sm">{model.body_type}</p>
                  </div>
                )}
                {model.fuel && (
                  <div>
                    <p className="text-xs text-muted-foreground">Combustible</p>
                    <p className="font-medium text-sm">{model.fuel}</p>
                  </div>
                )}
                {model.traction_type && (
                  <div>
                    <p className="text-xs text-muted-foreground">Tracción</p>
                    <p className="font-medium text-sm">{model.traction_type}</p>
                  </div>
                )}
                {model.transmission && (
                  <div>
                    <p className="text-xs text-muted-foreground">Transmisión</p>
                    <p className="font-medium text-sm">{model.transmission}</p>
                  </div>
                )}
                {model.power && (
                  <div>
                    <p className="text-xs text-muted-foreground">Potencia</p>
                    <p className="font-medium text-sm">{model.power}</p>
                  </div>
                )}
                {model.displacement && (
                  <div>
                    <p className="text-xs text-muted-foreground">Cilindrada</p>
                    <p className="font-medium text-sm">{model.displacement}</p>
                  </div>
                )}
                {model.cylinders_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Cilindros</p>
                    <p className="font-medium text-sm">
                      {model.cylinders_number}
                    </p>
                  </div>
                )}
                {model.seats_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Asientos</p>
                    <p className="font-medium text-sm">{model.seats_number}</p>
                  </div>
                )}
                {model.doors_number && (
                  <div>
                    <p className="text-xs text-muted-foreground">Puertas</p>
                    <p className="font-medium text-sm">{model.doors_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </GroupFormSection>

        {/* Bonos/Descuentos */}
        {hasBonusDiscounts && (
          <GroupFormSection
            title="Bonos y Descuentos"
            icon={Package}
            cols={{ sm: 1 }}
          >
            <div className="md:col-span-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Porcentaje</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.bonus_discounts.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {item.concept_code}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.type === "PORCENTAJE"
                          ? `${item.percentage}%`
                          : "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          item.is_negative ? "text-red-600" : "text-primary"
                        }`}
                      >
                        {item.is_negative ? "-" : "+"}{" "}
                        <NumberFormat value={Number(item.amount)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GroupFormSection>
        )}

        {/* Accesorios */}
        {hasAccessories && (
          <GroupFormSection title="Accesorios" icon={Package} cols={{ sm: 1 }}>
            <div className="md:col-span-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Accesorio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Precio Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.accessories.map((accessory, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">
                        #{accessory.approved_accessory_id}
                      </TableCell>
                      <TableCell>{accessory.type}</TableCell>
                      <TableCell className="text-right">
                        {accessory.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        <NumberFormat value={Number(accessory.price)} />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        <NumberFormat value={Number(accessory.total)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GroupFormSection>
        )}

        {/* Comentarios */}
        {quote.comment && (
          <GroupFormSection
            title="Comentarios"
            icon={MessageSquare}
            cols={{ sm: 1 }}
          >
            <div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {quote.comment}
              </p>
            </div>
          </GroupFormSection>
        )}
      </div>
    </GeneralSheet>
  );
}
