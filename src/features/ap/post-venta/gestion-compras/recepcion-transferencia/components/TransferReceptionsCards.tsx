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
  Hash,
  Warehouse,
} from "lucide-react";

interface TransferReceptionsCardsProps {
  data: TransferReceptionResource[];
  onDelete: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
  warehouseName?: string;
}

export default function TransferReceptionsCards({
  data,
  onDelete,
  permissions,
  warehouseName,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((reception) => (
        <Card key={reception.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-primary" />
                Recepción #{reception.id}
              </CardTitle>
              {permissions.canDelete && (
                <DeleteButton onClick={() => onDelete(reception.id)} />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reception.reception_number && (
              <div className="flex items-start gap-2">
                <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Nº Recepción</p>
                  <p className="font-semibold text-sm truncate">
                    {reception.reception_number}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  Fecha de Recepción
                </p>
                <p className="font-medium text-sm">
                  {format(new Date(reception.reception_date), "dd/MM/yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Warehouse className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Almacén</p>
                <p className="font-medium text-sm truncate">
                  {warehouseName || reception.warehouse?.description || "N/A"}
                </p>
              </div>
            </div>

            {reception.shipping_guide_number && (
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Guía de Remisión
                  </p>
                  <p className="font-medium text-sm truncate">
                    {reception.shipping_guide_number}
                  </p>
                </div>
              </div>
            )}

            {reception.received_by_user_name && (
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Recibido por</p>
                  <p className="font-medium text-sm truncate">
                    {reception.received_by_user_name}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="font-semibold text-sm">
                  {reception.total_items || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cantidad Total</p>
                <p className="font-semibold text-sm">
                  {reception.total_quantity || 0}
                </p>
              </div>
            </div>

            {reception.status && (
              <div className="pt-2">
                <Badge variant="default" className="w-full justify-center">
                  {reception.status}
                </Badge>
              </div>
            )}

            {reception.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {reception.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
