import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransferReceptionResource } from "../lib/transferReception.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import {
  Calendar,
  PackageCheck,
  FileText,
  User,
  Warehouse,
  ArrowRightLeft,
  TruckIcon,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";

interface TransferReceptionsCardsProps {
  data: TransferReceptionResource[];
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export default function TransferReceptionsCards({
  data,
  onDelete,
  permissions,
}: TransferReceptionsCardsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <PackageCheck className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">No hay recepciones registradas</p>
        <p className="text-sm">
          Las recepciones de esta transferencia aparecerán aquí
        </p>
      </div>
    );
  }

  // Grid responsivo dinámico basado en cantidad de items
  const getGridClass = () => {
    const count = data.length;
    if (count === 1) return "grid grid-cols-1 gap-4";
    if (count === 2) return "grid grid-cols-1 md:grid-cols-2 gap-4";
    return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";
  };

  return (
    <div className={getGridClass()}>
      {data.map((reception) => {
        const movement = reception.transfer_movement;
        const shippingGuide = reception.shipping_guide;
        const hasObservations = reception.has_observations;
        const isSingleItem = data.length === 1;

        return (
          <Card
            key={reception.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-primary" />
                  {reception.reception_number || `Recepción #${reception.id}`}
                </CardTitle>
                {permissions.canDelete && (
                  <DeleteButton onClick={() => onDelete(reception.id)} />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Status y Estado */}
              <div className="flex gap-2 mb-4">
                <Badge
                  variant={
                    reception.status === "APPROVED" ? "default" : "secondary"
                  }
                  className="flex items-center gap-1"
                >
                  {reception.status === "APPROVED" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {reception.status}
                </Badge>
                {hasObservations && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Con Observaciones
                  </Badge>
                )}
              </div>

              {/* Información Principal en Grid */}
              <div
                className={`${
                  isSingleItem
                    ? "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 py-4"
                    : "space-y-3"
                }`}
              >
                {/* Fecha de Recepción */}
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground">Fecha de Recepción</p>
                    <p className="font-medium">
                      {format(
                        new Date(reception.reception_date),
                        "dd/MM/yyyy",
                        {
                          locale: es,
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Transferencia: Origen → Destino */}
                <div className="flex items-start gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground">Transferencia</p>
                    <div className="space-y-1">
                      <p className="font-medium truncate">
                        <span className="text-primary">
                          {movement.warehouse_origin.dyn_code}
                        </span>
                        {" → "}
                        <span className="text-green-600">
                          {movement.warehouse_destination.dyn_code}
                        </span>
                      </p>
                      <p className="text-muted-foreground truncate text-sm">
                        {movement.warehouse_origin.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Guía de Remisión */}
                {shippingGuide && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground">Guía de Remisión</p>
                      <p className="font-medium truncate">
                        {shippingGuide.document_number}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {shippingGuide.aceptada_por_sunat && (
                          <Badge
                            variant="outline"
                            className="h-5 bg-green-50 text-green-700 border-green-200"
                          >
                            SUNAT: {shippingGuide.sunat_description}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Transporte */}
                {shippingGuide && (
                  <div className="flex items-start gap-2">
                    <TruckIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground">Transporte</p>
                      <p className="font-medium truncate">
                        {shippingGuide.company_name_transport}
                      </p>
                      <p className="text-muted-foreground">
                        Placa: {shippingGuide.plate} • Conductor:{" "}
                        {shippingGuide.driver_name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Almacén Destino */}
                <div className="flex items-start gap-2">
                  <Warehouse className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground">Almacén Recepción</p>
                    <p className="font-medium truncate">
                      {reception.warehouse.description}
                    </p>
                  </div>
                </div>

                {/* Recibido por */}
                {reception.received_name && (
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground">Recibido por</p>
                      <p className="font-medium truncate">
                        {reception.received_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Productos Recibidos */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 py-2">
                  <Package className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-primary">
                    Productos Recibidos ({reception.details.length})
                  </p>
                </div>
                <div className="space-y-2 py-4">
                  {reception.details.map((detail) => (
                    <div
                      key={detail.id}
                      className="bg-slate-50 rounded-md p-2 border border-slate-200"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-slate-800">
                            {detail.product.name}
                          </p>
                          <p className="text-muted-foreground">
                            Código: {detail.product.code}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-green-600">
                            {detail.quantity_received}
                          </p>
                          {parseFloat(detail.observed_quantity) > 0 && (
                            <p className="text-orange-600">
                              Obs: {detail.observed_quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t py-4">
                <div>
                  <p className="text-muted-foreground">Cantidad Total</p>
                  <p className="font-semibold text-sm">
                    {reception.total_quantity}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completado</p>
                  <p className="font-semibold text-sm text-green-600">
                    {reception.completion_percentage}%
                  </p>
                </div>
              </div>

              {/* Observaciones */}
              {hasObservations && (
                <div className="pt-2 border-t bg-orange-50 -mx-6 -mb-6 px-6 pb-6 mt-3 rounded-b-lg">
                  <p className="font-medium text-orange-700 mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Observaciones Detectadas
                  </p>
                  <p className="text-orange-600">
                    Cantidad observada: {reception.total_observed_quantity}
                  </p>
                </div>
              )}

              {/* Notas */}
              {reception.notes && !hasObservations && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground mb-1">Notas</p>
                  <p className="text-gray-600 line-clamp-2">
                    {reception.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
