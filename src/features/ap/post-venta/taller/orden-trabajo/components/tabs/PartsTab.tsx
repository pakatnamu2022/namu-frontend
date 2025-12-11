"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAllWorkOrderParts,
  confirmWorkOrderParts,
} from "@/features/ap/post-venta/taller/orden-trabajo-repuesto/lib/workOrderParts.actions";
import {
  GROUP_COLORS,
  DEFAULT_GROUP_COLOR,
} from "../../lib/workOrder.interface";
import { errorToast, successToast } from "@/core/core.function";

interface PartsTabProps {
  workOrderId: number;
}

export default function PartsTab({ workOrderId }: PartsTabProps) {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["workOrderParts", workOrderId],
    queryFn: () =>
      getAllWorkOrderParts({ params: { work_order_id: workOrderId } }),
    enabled: !!workOrderId,
  });

  const handleConfirm = async (id: number) => {
    try {
      setConfirmingId(id);
      await confirmWorkOrderParts(id);
      successToast("Repuesto confirmado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderParts", workOrderId],
      });
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al confirmar el repuesto");
    } finally {
      setConfirmingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay repuestos solicitados
          </h3>
          <p className="text-sm text-gray-600">
            Aún no se han solicitado repuestos para esta orden de trabajo
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Repuestos Solicitados</h3>
            <p className="text-sm text-gray-600">
              {parts.length} repuesto{parts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Almacén</TableHead>
              <TableHead>Solicitado</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => {
              const groupColor =
                GROUP_COLORS[part.group_number] || DEFAULT_GROUP_COLOR;
              const isConfirming = confirmingId === part.id;

              return (
                <TableRow key={part.id}>
                  <TableCell>
                    <Badge
                      className="font-semibold"
                      style={{ backgroundColor: groupColor.badge }}
                    >
                      Grupo {part.group_number}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{part.product_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">
                      {part.warehouse_name}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">
                      {part.registered_by_name}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-semibold">
                      {part.quantity_used}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={`shrink-0 ${
                        part.is_delivered
                          ? "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                      }`}
                    >
                      {part.is_delivered ? "Aprobado" : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      onClick={() => handleConfirm(part.id)}
                      disabled={isConfirming || part.is_delivered}
                      className="gap-2"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Confirmando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Confirmar
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
