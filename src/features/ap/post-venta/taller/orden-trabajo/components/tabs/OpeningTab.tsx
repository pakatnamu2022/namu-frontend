"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import {
  DEFAULT_GROUP_COLOR,
  GROUP_COLORS,
} from "../../lib/workOrder.interface";
import WorkOrderItemForm from "../../../orden-trabajo-item/components/WorkOrderItemForm";
import { deleteWorkOrderItem } from "../../../orden-trabajo-item/lib/workOrderItem.actions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { useIsTablet } from "@/hooks/use-mobile";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { WORKER_ORDER_ITEM } from "../../../orden-trabajo-item/lib/workOrderItem.constants";
import { SUCCESS_MESSAGE, successToast } from "@/core/core.function";

const getGroupColor = (groupNumber: number) => {
  return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
};

interface OpeningTabProps {
  workOrderId: number;
}

export default function OpeningTab({ workOrderId }: OpeningTabProps) {
  const isTablet = useIsTablet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { MODEL } = WORKER_ORDER_ITEM;

  // Consultar la orden de trabajo con sus items
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  // Mutación para eliminar item
  const deleteMutation = useMutation({
    mutationFn: (itemId: number) => deleteWorkOrderItem(itemId),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
      setItemToDelete(null);
    },
    onError: () => {
      toast.error("Error al eliminar el item");
    },
  });

  const items = workOrder?.items || [];

  const defaultGroupNumber =
    items.length > 0 ? Math.max(...items.map((i) => i.group_number)) + 1 : 1;

  const handleAddItem = () => {
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleDeleteClick = (itemId: number) => {
    setItemToDelete(itemId);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando trabajos...</span>
      </div>
    );
  }

  return (
    <div className="grid gap-6 w-full">
      {/* Header with Add Button */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold">
              Apertura de Orden de Trabajo
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Gestiona los trabajos de servicio para esta orden
            </p>
          </div>
          <Button onClick={handleAddItem} className="w-full sm:w-auto shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Trabajo
          </Button>
        </div>
      </Card>

      {/* Items by Group */}
      {items.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide w-full">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Grupo
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Descripción
                  </th>
                  <th className="text-center py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const colors = getGroupColor(item.group_number);
                  return (
                    <tr
                      key={item.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <Badge
                          className="text-white text-xs"
                          style={{ backgroundColor: colors.badge }}
                        >
                          Grupo {item.group_number}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <Badge
                          variant="outline"
                          className="text-xs whitespace-nowrap"
                        >
                          {item.type_planning_name}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-900 max-w-xs">
                        <div className="line-clamp-2">{item.description}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <Card className="p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Plus className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
              No hay trabajos registrados
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Comienza agregando trabajos de servicio para esta orden
            </p>
          </div>
        </Card>
      )}

      {/* Add Dialog */}
      <GeneralSheet
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Agregar Nuevo Trabajo"
        type={isTablet ? "tablet" : "default"}
        className="sm:max-w-2xl"
      >
        <WorkOrderItemForm
          workOrderId={workOrderId}
          defaultGroupNumber={defaultGroupNumber}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </GeneralSheet>

      {/* Delete Confirmation Drawer */}
      <SimpleDeleteDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
