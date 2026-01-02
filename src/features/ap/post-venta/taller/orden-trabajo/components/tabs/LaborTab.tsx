"use client";

import { useEffect, useMemo, useState } from "react";
import { Wrench, Loader2, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WorkOrderLabourForm from "@/features/ap/post-venta/taller/orden-trabajo-labor/components/WorkOrderLabourForm";
import {
  useGetAllWorkOrderLabour,
  useUpdateWorkOrderLabour,
  useDeleteWorkOrderLabour,
} from "@/features/ap/post-venta/taller/orden-trabajo-labor/lib/workOrderLabour.hook";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { useQuery } from "@tanstack/react-query";

interface LaborTabProps {
  workOrderId: number;
}

export default function LaborTab({ workOrderId }: LaborTabProps) {
  const [showForm, setShowForm] = useState(false);
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: labours = [], isLoading } = useGetAllWorkOrderLabour({
    work_order_id: workOrderId,
  });

  // Consultar la orden de trabajo con sus items
  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  const items = useMemo(() => workOrder?.items || [], [workOrder?.items]);

  // Obtener los números de grupos únicos disponibles
  const availableGroups = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.group_number))).sort();
  }, [items]);

  const updateGroupMutation = useUpdateWorkOrderLabour();

  const handleGroupChange = (labour: any, newGroupNumber: number) => {
    updateGroupMutation.mutate({
      id: labour.id,
      data: {
        description: labour.description,
        time_spent: labour.time_spent,
        hourly_rate: labour.hourly_rate,
        work_order_id: labour.work_order_id,
        worker_id: Number(labour.worker_id),
        group_number: newGroupNumber,
      },
    });
  };

  // Auto-seleccionar el primer grupo si no hay ninguno seleccionado
  useEffect(() => {
    if (items.length > 0 && selectedGroupNumber === null) {
      const firstGroup = Math.min(...items.map((i) => i.group_number));
      setSelectedGroupNumber(firstGroup);
    }
  }, [items, selectedGroupNumber, setSelectedGroupNumber]);

  // Filtrar las manos de obra según el grupo seleccionado
  const filteredLabours = labours.filter(
    (labour) => labour.group_number === selectedGroupNumber
  );

  const deleteMutation = useDeleteWorkOrderLabour();

  const handleSuccess = () => {
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
      },
    });
  };

  if (isLoading || isLoadingWorkOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de Grupo */}
      <GroupSelector
        items={items}
        selectedGroupNumber={selectedGroupNumber}
        onSelectGroup={setSelectedGroupNumber}
      />

      {/* Add Labor Button */}
      {!showForm && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Mano de Obra
          </Button>
        </div>
      )}

      {/* Labor Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Wrench className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Registrar Mano de Obra</h3>
          </div>

          <WorkOrderLabourForm
            workOrderId={workOrderId}
            groupNumber={selectedGroupNumber!}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {/* Labor List Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Mano de Obra Registrada</h3>

        {filteredLabours.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay registros de mano de obra para este grupo
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-left">Operario</TableHead>
                  <TableHead className="text-right">Tiempo (hrs)</TableHead>
                  <TableHead className="text-right">Tarifa/Hora</TableHead>
                  <TableHead className="text-right">Costo Total</TableHead>
                  <TableHead className="text-center">Grupo</TableHead>
                  <TableHead className="text-center w-[100px]">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLabours.map((labour) => (
                  <TableRow key={labour.id}>
                    <TableCell className="max-w-md">
                      <div className="line-clamp-2">{labour.description}</div>
                    </TableCell>
                    <TableCell className="text-left">
                      {labour.worker_full_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {labour.time_spent}
                    </TableCell>
                    <TableCell className="text-right">
                      S/ {labour.hourly_rate}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      S/ {labour.total_cost}
                    </TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={labour.group_number?.toString() || ""}
                        onValueChange={(value) =>
                          handleGroupChange(labour, Number(value))
                        }
                      >
                        <SelectTrigger className="w-[120px] mx-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGroups.map((groupNumber) => (
                            <SelectItem
                              key={groupNumber}
                              value={groupNumber.toString()}
                            >
                              Grupo {groupNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(labour.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Total */}
            {filteredLabours.length > 0 && (
              <div className="flex justify-end mt-4 pt-4 border-t">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Mano de Obra:</p>
                  <p className="text-xl font-bold">
                    S/{" "}
                    {filteredLabours
                      .reduce(
                        (acc, labour) =>
                          acc + parseFloat(labour.total_cost || "0"),
                        0
                      )
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
