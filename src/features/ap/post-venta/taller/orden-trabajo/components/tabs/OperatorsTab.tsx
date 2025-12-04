"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCog, Loader2, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import {
  DEFAULT_GROUP_COLOR,
  GROUP_COLORS,
} from "../../lib/workOrder.interface";
import { WorkOrderItemResource } from "../../../orden-trabajo-item/lib/workOrderItem.interface";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import { useIsTablet } from "@/hooks/use-mobile";
import GeneralSheet from "@/shared/components/GeneralSheet";
import OperatorWorkOrderForm from "../../../orden-trabajo-operario/components/OperatorWorkOrderForm";
import {
  getAllOperatorWorkOrder,
  deleteOperatorWorkOrder,
} from "../../../orden-trabajo-operario/lib/operatorWorkOrder.actions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { OPERATOR_WORKER_ORDER } from "../../../orden-trabajo-operario/lib/operatorWorkOrder.constants";
import { SUCCESS_MESSAGE, successToast } from "@/core/core.function";

const getGroupColor = (groupNumber: number) => {
  return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
};

interface OperatorsTabProps {
  workOrderId: number;
}

export default function OperatorsTab({ workOrderId }: OperatorsTabProps) {
  const isTablet = useIsTablet();
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<number | null>(
    null
  );
  const queryClient = useQueryClient();
  const { MODEL } = OPERATOR_WORKER_ORDER;

  // Consultar la orden de trabajo con sus items
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  // Consultar las asignaciones de operarios
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["workOrderAssignOperators", workOrderId],
    queryFn: () =>
      getAllOperatorWorkOrder({ params: { work_order_id: workOrderId } }),
  });

  // Mutación para eliminar asignación
  const deleteMutation = useMutation({
    mutationFn: (assignmentId: number) => deleteOperatorWorkOrder(assignmentId),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      queryClient.invalidateQueries({
        queryKey: ["workOrderAssignOperators", workOrderId],
      });
      setAssignmentToDelete(null);
    },
    onError: () => {
      toast.error("Error al eliminar la asignación");
    },
  });

  const items = useMemo(() => workOrder?.items || [], [workOrder?.items]);

  // Auto-seleccionar el primer grupo si no hay ninguno seleccionado
  useEffect(() => {
    if (items.length > 0 && selectedGroupNumber === null) {
      const firstGroup = Math.min(...items.map((i) => i.group_number));
      setSelectedGroupNumber(firstGroup);
    }
  }, [items, selectedGroupNumber, setSelectedGroupNumber]);

  // Agrupar items por número de grupo
  const groupedItems = items.reduce((acc, item) => {
    const key = item.group_number;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<number, WorkOrderItemResource[]>);

  const selectedGroupItems = selectedGroupNumber
    ? groupedItems[selectedGroupNumber] || []
    : [];

  const handleAssignOperator = () => {
    if (!selectedGroupNumber) {
      toast.error("Selecciona un grupo primero");
      return;
    }

    if (selectedGroupItems.length === 0) {
      toast.error("No hay trabajos en este grupo para asignar");
      return;
    }

    setIsSheetOpen(true);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    queryClient.invalidateQueries({
      queryKey: ["workOrderAssignOperators", workOrderId],
    });
  };

  const handleCancel = () => {
    setIsSheetOpen(false);
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    setAssignmentToDelete(assignmentId);
  };

  const handleConfirmDelete = async () => {
    if (assignmentToDelete) {
      deleteMutation.mutate(assignmentToDelete);
    }
  };

  const getGroupAssignments = (groupNumber: number) => {
    return assignments.filter((assignment) => {
      return assignment.group_number === groupNumber;
    });
  };

  if (isLoading || isLoadingAssignments) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando información...</span>
      </div>
    );
  }

  const selectedGroupAssignments = selectedGroupNumber
    ? getGroupAssignments(selectedGroupNumber)
    : [];
  const colors = selectedGroupNumber
    ? getGroupColor(selectedGroupNumber)
    : DEFAULT_GROUP_COLOR;

  return (
    <div className="grid grid-cols-12 gap-4 sm:gap-6">
      {/* Selector de grupos a la izquierda */}
      <div className="col-span-12 lg:col-span-3">
        <GroupSelector
          items={items}
          selectedGroupNumber={selectedGroupNumber}
          onSelectGroup={setSelectedGroupNumber}
        />
      </div>

      {/* Contenido principal */}
      <div className="col-span-12 lg:col-span-9">
        <div className="grid gap-4 sm:gap-6">
          {/* Header */}
          <Card className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 flex-wrap">
                  <UserCog className="h-5 w-5 shrink-0" />
                  <span>Asignación de Operarios</span>
                  {selectedGroupNumber && (
                    <Badge
                      className="text-white text-xs sm:text-sm"
                      style={{ backgroundColor: colors.badge }}
                    >
                      Grupo {selectedGroupNumber}
                    </Badge>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Asigna operarios para trabajar en este grupo
                </p>
              </div>
            </div>
          </Card>

          {/* Contenido del grupo seleccionado */}
          {selectedGroupNumber ? (
            <>
              {/* Items del grupo */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                    Trabajos del Grupo {selectedGroupNumber}
                  </h4>
                  <span className="text-xs sm:text-sm text-gray-600">
                    {selectedGroupItems.length} trabajo(s)
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedGroupItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg text-xs sm:text-sm"
                    >
                      <div className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge
                          variant="outline"
                          className="text-xs mr-2 border-gray-300 mb-1 sm:mb-0"
                        >
                          {item.type_planning_name}
                        </Badge>
                        <span className="text-gray-700 wrap-break-word">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Operarios asignados */}
              <Card className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">
                    Operarios Asignados
                  </h4>
                  <Button
                    onClick={handleAssignOperator}
                    className="w-full sm:w-auto"
                    size={isTablet ? "default" : "default"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Asignar Operario
                  </Button>
                </div>

                {selectedGroupAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">
                      No hay operarios asignados a este grupo
                    </p>
                    <p className="text-xs text-gray-500">
                      Asigna el primer operario para este grupo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedGroupAssignments.map((assignment) => {
                      return (
                        <div
                          key={assignment.id}
                          className="border rounded-lg p-3 bg-white hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <UserCog className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {assignment.operator_name}
                                </p>
                                {assignment.observations && (
                                  <p className="text-xs text-gray-600 truncate mt-0.5">
                                    {assignment.observations}
                                  </p>
                                )}
                              </div>
                              <Badge variant="default">
                                {assignment.status || "Asignado"}
                              </Badge>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                              onClick={() =>
                                handleDeleteAssignment(assignment.id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-8 sm:p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <UserCog className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">
                  Selecciona un grupo
                </h3>
                <p className="text-sm text-gray-500">
                  Elige un grupo de la izquierda para asignar operarios
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Sheet para asignar operario */}
      <GeneralSheet
        open={isSheetOpen}
        onClose={handleCancel}
        title={`Asignar Operario - Grupo ${selectedGroupNumber || ""}`}
        type={isTablet ? "tablet" : "default"}
        className="sm:max-w-2xl"
      >
        {selectedGroupNumber && (
          <OperatorWorkOrderForm
            workOrderId={workOrderId}
            groupNumber={selectedGroupNumber}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </GeneralSheet>

      {/* Confirmación de eliminación */}
      <SimpleDeleteDialog
        open={assignmentToDelete !== null}
        onOpenChange={(open) => !open && setAssignmentToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
