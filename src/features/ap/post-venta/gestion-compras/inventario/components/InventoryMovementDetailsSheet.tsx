import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InventoryMovementResource } from "../lib/inventoryMovements.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface InventoryMovementDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: InventoryMovementResource;
}

export default function InventoryMovementDetailsSheet({
  open,
  onOpenChange,
  movement,
}: InventoryMovementDetailsSheetProps) {
  const renderReferenceDetails = () => {
    if (!movement.reference) return null;

    const { movement_type } = movement;
    const reference = movement.reference as Record<string, any>;

    switch (movement_type) {
      case "PURCHASE_RECEPTION":
        return (
          <div className="border rounded-lg">
            <div className="p-4 bg-muted/50 border-b">
              <h3 className="font-semibold text-sm">Detalles de Recepción</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <p className="text-xs text-muted-foreground">N° Recepción</p>
                <p className="font-semibold">{reference.reception_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">
                  {format(new Date(reference.reception_date), "dd/MM/yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">N° Guía</p>
                <p className="font-medium">
                  {reference.shipping_guide_number || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge
                  variant={
                    reference.status === "APPROVED" ? "default" : "secondary"
                  }
                >
                  {reference.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tipo</p>
                <p className="font-medium">{reference.reception_type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="font-medium">{reference.total_items}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cantidad Total</p>
                <p className="font-medium">{reference.total_quantity}</p>
              </div>
              {reference.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="font-medium text-sm">{reference.notes}</p>
                </div>
              )}
            </div>
          </div>
        );

      case "TRANSFER_OUT":
        return (
          <div className="space-y-4">
            {/* Información Principal */}
            <div className="border rounded-lg">
              <div className="p-4 bg-muted/50 border-b">
                <h3 className="font-semibold text-sm">
                  Detalles de Transferencia
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="text-xs text-muted-foreground">N° Documento</p>
                  <p className="font-semibold">{reference.document_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Serie</p>
                  <p className="font-medium">{reference.series}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha Emisión</p>
                  <p className="font-medium">
                    {format(new Date(reference.issue_date), "dd/MM/yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Total Paquetes
                  </p>
                  <p className="font-medium">{reference.total_packages}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Peso Total</p>
                  <p className="font-medium">{reference.total_weight} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Estado SUNAT</p>
                  <Badge
                    variant={
                      reference.aceptada_por_sunat ? "default" : "secondary"
                    }
                  >
                    {reference.sunat_description || "PENDIENTE"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información del Transportista */}
            <div className="border rounded-lg">
              <div className="p-3 bg-muted/50 border-b">
                <h4 className="font-semibold text-xs">
                  Información del Transportista
                </h4>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="font-medium text-sm">
                    {reference.company_name_transport}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    RUC: {reference.ruc_transport}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conductor</p>
                  <p className="font-medium text-sm">{reference.driver_name}</p>
                  <p className="text-xs text-muted-foreground">
                    DNI: {reference.driver_doc} | Licencia: {reference.license}{" "}
                    | Placa: {reference.plate}
                  </p>
                </div>
              </div>
            </div>

            {/* Direcciones */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Origen</p>
                <p className="font-medium text-sm">
                  {reference.origin_address}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Destino</p>
                <p className="font-medium text-sm">
                  {reference.destination_address}
                </p>
              </div>
            </div>

            {reference.notes && (
              <div className="p-4 border rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="font-medium text-sm">{reference.notes}</p>
              </div>
            )}

            {reference.enlace_del_pdf && (
              <div>
                <a
                  href={reference.enlace_del_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  📄 Ver PDF del Documento
                </a>
              </div>
            )}
          </div>
        );

      case "ADJUSTMENT_OUT":
        return (
          <div className="border rounded-lg">
            <div className="p-4 bg-muted/50 border-b">
              <h3 className="font-semibold text-sm">
                Detalles de Ajuste de Salida
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <p className="text-xs text-muted-foreground">N° Grupo</p>
                <p className="font-semibold">{reference.group_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cantidad Usada</p>
                <p className="font-medium">{reference.quantity_used}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Costo Unitario</p>
                <p className="font-medium">S/ {reference.unit_cost}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio Unitario</p>
                <p className="font-medium">S/ {reference.unit_price}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Descuento</p>
                <p className="font-medium">{reference.discount_percentage}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Subtotal</p>
                <p className="font-medium">S/ {reference.subtotal}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IGV</p>
                <p className="font-medium">S/ {reference.tax_amount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold text-lg">
                  S/ {reference.total_amount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado Entrega</p>
                <Badge
                  variant={reference.is_delivered ? "default" : "secondary"}
                >
                  {reference.is_delivered ? "ENTREGADO" : "PENDIENTE"}
                </Badge>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Detalles del Movimiento</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Información General del Movimiento */}
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 border-b rounded-t-lg">
              <h3 className="font-semibold text-sm">Información General</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 px-4">
              <div>
                <p className="text-xs text-muted-foreground">N° Movimiento</p>
                <p className="font-semibold">{movement.movement_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">
                  {format(
                    new Date(movement.movement_date),
                    "dd/MM/yyyy HH:mm",
                    {
                      locale: es,
                    }
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Cantidad Entrada
                </p>
                <p className="font-semibold text-green-600 text-lg">
                  {movement.quantity_in}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cantidad Salida</p>
                <p className="font-semibold text-red-600 text-lg">
                  {movement.quantity_out}
                </p>
              </div>
              {movement.user_name && (
                <div>
                  <p className="text-xs text-muted-foreground">Usuario</p>
                  <p className="font-medium">{movement.user_name}</p>
                </div>
              )}
              {movement.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="font-medium text-sm">{movement.notes}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Detalles de la Referencia */}
          {renderReferenceDetails()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
