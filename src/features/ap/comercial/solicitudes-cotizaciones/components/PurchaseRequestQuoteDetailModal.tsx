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
  DollarSign,
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

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalle de Cotización"
      subtitle={`${quote.correlative} - ${quote.type_document}`}
      icon="FileText"
      side="right"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Badge de estado */}
        <div className="flex justify-end">
          <Badge
            color={quote.is_approved ? "default" : "secondary"}
            className={quote.is_approved ? "bg-primary" : "bg-secondary"}
          >
            {quote.is_approved ? "Aprobado" : "Pendiente"}
          </Badge>
        </div>

        {/* Información General */}
        <GroupFormSection
          title="Información General"
          icon={FileText}
          cols={{ sm: 1, md: 2 }}
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
            <p className="font-medium">{(quote as any).sede || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Garantía</p>
            <p className="font-medium">{quote.warranty || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Asesor</p>
            <p className="font-medium">{quote.consultant?.name || "N/A"}</p>
          </div>
        </GroupFormSection>

        {/* Información del Titular/Cliente */}
        <GroupFormSection
          title="Información del Titular"
          icon={User}
          cols={{ sm: 1, md: 2 }}
        >
          <div>
            <p className="text-xs text-muted-foreground">Nombre Completo</p>
            <p className="font-semibold">{quote.holder}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-medium">{(quote as any).client_name || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo de Documento</p>
            <p className="font-medium">
              {quote.holder_document_type === 1 ? "DNI" : "RUC"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Número de Documento
            </p>
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
          <div className="md:col-span-2">
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
          cols={{ sm: 1, md: 2 }}
        >
          <div>
            <p className="text-xs text-muted-foreground">Modelo</p>
            <p className="font-semibold">{quote.ap_model_vn || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Color</p>
            <p className="font-medium">{quote.vehicle_color || "N/A"}</p>
          </div>
          {quote.ap_vehicle && (
            <>
              <div className="md:col-span-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Vehículo Asignado
                </p>
                <div className="p-3 bg-muted/30 rounded-lg border border-muted-foreground/10">
                  <p className="font-semibold text-sm mb-2">
                    {quote.ap_vehicle.model.version}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">VIN:</span>{" "}
                      {quote.ap_vehicle.vin}
                    </div>
                    <div>
                      <span className="font-medium">Año:</span>{" "}
                      {quote.ap_vehicle.year}
                    </div>
                    <div>
                      <span className="font-medium">Color:</span>{" "}
                      {quote.ap_vehicle.vehicle_color}
                    </div>
                    <div>
                      <span className="font-medium">Motor:</span>{" "}
                      {quote.ap_vehicle.engine_type}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </GroupFormSection>

        {/* Información Financiera */}
        <GroupFormSection
          title="Información Financiera"
          icon={DollarSign}
          cols={{ sm: 1, md: 2 }}
        >
          <div>
            <p className="text-xs text-muted-foreground">Moneda</p>
            <p className="font-medium">{(quote as any).type_currency || quote.doc_type_currency}</p>
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
          <div className="md:col-span-2">
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-primary">
                  Precio de Venta Facturado
                </span>
                <span className="text-lg font-bold text-primary">
                  {quote.doc_type_currency_symbol}{" "}
                  <NumberFormat value={quote.doc_sale_price} />
                </span>
              </div>
            </div>
          </div>
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
          <GroupFormSection
            title="Accesorios"
            icon={Package}
            cols={{ sm: 1 }}
          >
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
