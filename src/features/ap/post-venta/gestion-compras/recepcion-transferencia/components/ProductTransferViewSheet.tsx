import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api";
import { Loader2 } from "lucide-react";

interface ProductTransferViewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferId: number | null;
}

interface TransferDetail {
  id: number;
  inventory_movement_id: number;
  product_id: number;
  quantity: string;
  unit_cost: string;
  total_cost: string;
  product: {
    id: number;
    code: string;
    dyn_code: string;
    name: string;
    description: string;
    cost_price: string;
    sale_price: string;
  };
}

interface TransferData {
  id: number;
  movement_number: string;
  movement_type: string;
  movement_date: string;
  warehouse_id: number;
  warehouse_code: string;
  warehouse: {
    id: number;
    dyn_code: string;
    description: string;
    sede_id: number;
  };
  warehouse_destination_id: number;
  warehouse_destination_code: string;
  warehouse_destination: {
    id: number;
    dyn_code: string;
    description: string;
    sede_id: number;
  };
  user_id: number;
  user_name: string;
  status: string;
  notes: string;
  total_items: number;
  total_quantity: string;
  details: TransferDetail[];
  created_at: string;
  updated_at: string;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    IN_TRANSIT: { label: "En Tránsito", variant: "default" as const },
    COMPLETED: { label: "Completado", variant: "secondary" as const },
    CANCELLED: { label: "Cancelado", variant: "destructive" as const },
    PENDING: { label: "Pendiente", variant: "outline" as const },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: "default" as const,
  };

  return (
    <Badge variant={config.variant} className="capitalize">
      {config.label}
    </Badge>
  );
};

export function ProductTransferViewSheet({
  open,
  onOpenChange,
  transferId,
}: ProductTransferViewSheetProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["product-transfer-detail", transferId],
    queryFn: async () => {
      const response = await api.get<TransferData>(
        `/ap/postVenta/inventoryMovements/${transferId}`
      );
      return response.data;
    },
    enabled: !!transferId && open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalle de Transferencia</SheetTitle>
          <SheetDescription>
            Información completa de la transferencia de productos
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-6 mt-6">
            {/* Información General */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información General</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    N° Movimiento
                  </p>
                  <p className="font-medium">{data.movement_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  {getStatusBadge(data.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de Movimiento
                  </p>
                  <p className="font-medium">
                    {format(new Date(data.movement_date), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Tipo de Movimiento
                  </p>
                  <Badge variant="outline" className="capitalize">
                    {data.movement_type === "TRANSFER_OUT"
                      ? "Transferencia Salida"
                      : data.movement_type}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Información de Almacenes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Almacenes</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Almacén Origen
                  </p>
                  <p className="font-semibold">{data.warehouse_code}</p>
                  <p className="text-sm">{data.warehouse.description}</p>
                </div>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    Almacén Destino
                  </p>
                  <p className="font-semibold">
                    {data.warehouse_destination_code}
                  </p>
                  <p className="text-sm">
                    {data.warehouse_destination.description}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Productos Transferidos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Productos Transferidos</h3>
              <div className="space-y-3">
                {data.details.map((detail: TransferDetail, index: number) => (
                  <div
                    key={detail.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">{detail.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Código: {detail.product.code} | Código Dinámico:{" "}
                          {detail.product.dyn_code}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {detail.product.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {index + 1}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Cantidad
                        </p>
                        <p className="font-medium">{detail.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Costo Unitario
                        </p>
                        <p className="font-medium">
                          S/ {parseFloat(detail.unit_cost).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Costo Total
                        </p>
                        <p className="font-medium">
                          S/ {parseFloat(detail.total_cost).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Resumen */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Resumen</h3>
              <div className="grid grid-cols-2 gap-4 border rounded-lg p-4 bg-muted/30">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Ítems
                  </p>
                  <p className="font-semibold text-lg">{data.total_items}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cantidad Total
                  </p>
                  <p className="font-semibold text-lg">
                    {parseFloat(data.total_quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            {data.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Observaciones</h3>
                  <p className="text-sm border rounded-lg p-3 bg-muted/20">
                    {data.notes}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Información de Registro */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información de Registro</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Registrado por</p>
                  <p className="font-medium">{data.user_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fecha de creación</p>
                  <p className="font-medium">
                    {format(new Date(data.created_at), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
                {data.updated_at !== data.created_at && (
                  <div>
                    <p className="text-muted-foreground">
                      Última actualización
                    </p>
                    <p className="font-medium">
                      {format(new Date(data.updated_at), "dd/MM/yyyy HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              No se encontró información de la transferencia
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
