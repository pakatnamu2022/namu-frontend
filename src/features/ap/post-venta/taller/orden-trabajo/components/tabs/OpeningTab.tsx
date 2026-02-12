"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, User } from "lucide-react";
import {
  findWorkOrderById,
  updateInvoiceTo,
} from "../../lib/workOrder.actions";
import {
  DEFAULT_GROUP_COLOR,
  GROUP_COLORS,
} from "../../lib/workOrder.interface";
import WorkOrderItemForm from "../../../orden-trabajo-item/components/WorkOrderItemForm";
import { deleteWorkOrderItem } from "../../../orden-trabajo-item/lib/workOrderItem.actions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { WORKER_ORDER_ITEM } from "../../../orden-trabajo-item/lib/workOrderItem.constants";
import {
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useIsTablet } from "@/hooks/use-tablet";
import { downloadOrderReceiptPdf } from "../../../inspeccion-vehiculo/lib/vehicleInspection.actions";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useCustomers } from "@/features/ap/comercial/clientes/lib/customers.hook";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";

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
  const [isDownloading, setIsDownloading] = useState(false);
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
      errorToast("Error al eliminar el item");
    },
  });

  // Formulario mínimo solo para el FormSelectAsync de "Facturar a"
  const invoiceToForm = useForm<{ invoice_to_id: string }>({
    defaultValues: { invoice_to_id: "" },
  });

  // Mutación para actualizar invoice_to
  const invoiceToMutation = useMutation({
    mutationFn: (customerId: number | null) =>
      updateInvoiceTo(workOrderId, customerId),
    onSuccess: () => {
      successToast("Cliente de facturación actualizado");
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
    },
    onError: () => {
      errorToast("Error al actualizar el cliente de facturación");
    },
  });

  // Si ya existe invoice_to desde el backend, precargar el select
  const invoiceToDefaultOption = useMemo(() => {
    if (workOrder?.invoice_to) {
      return {
        value: workOrder.invoice_to.toString(),
        label: `${workOrder.invoice_to_client?.full_name} - ${workOrder.invoice_to_client?.num_doc || "S/N"}`,
      };
    }
    return undefined;
  }, [workOrder?.invoice_to, workOrder?.invoice_to_client]);

  // Cuando el backend devuelve invoice_to, setear el valor del form
  useEffect(() => {
    if (invoiceToDefaultOption) {
      invoiceToForm.setValue("invoice_to_id", invoiceToDefaultOption.value);
    }
  }, [invoiceToDefaultOption, invoiceToForm]);

  // La OT ya tiene factura emitida → bloquear edición
  const isInvoiced = workOrder?.is_invoiced === true;

  const items = workOrder?.items || [];

  const defaultGroupNumber =
    items.length > 0 ? Math.max(...items.map((i) => i.group_number)) + 1 : 1;

  const inspection = workOrder?.vehicle_inspection;

  const handleDownloadOrderReceipt = async () => {
    if (!inspection?.id) return;

    try {
      setIsDownloading(true);
      await downloadOrderReceiptPdf(inspection.id);
      successToast("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      errorToast("Error al descargar la orden de recepción");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddItem = () => {
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  // const handleDeleteClick = (itemId: number) => {
  //   setItemToDelete(itemId);
  // };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Cargando trabajos...</p>
        </div>
      </Card>
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            {inspection?.id && (
              <Button
                onClick={handleDownloadOrderReceipt}
                disabled={isDownloading}
                className="w-full sm:w-auto gap-2"
              >
                <FileText className="h-4 w-4" />
                {isDownloading ? "Generando PDF..." : "Generar O.R - Personal"}
              </Button>
            )}
            {items.length === 0 && (
              <Button onClick={handleAddItem} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Trabajo
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Items by Group */}
      {items.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide w-full">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Grupo
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Planificación
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Operación
                  </th>
                  <th className="text-left py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Descripción
                  </th>
                  {/* <th className="text-center py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm text-gray-700">
                    Acciones
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const colors = getGroupColor(item.group_number);
                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition-colors"
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
                      <td className="py-3 px-3 sm:px-4">
                        <Badge
                          variant="outline"
                          className="text-xs whitespace-nowrap"
                        >
                          {item.type_operation_name}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-900 max-w-xs">
                        <div className="line-clamp-2">{item.description}</div>
                      </td>
                      {/* <td className="py-3 px-3 sm:px-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección: Facturar a */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900">
              Facturar a
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {isInvoiced
                ? "Cliente de facturación establecido"
                : "Selecciona el cliente para la factura"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormProvider {...invoiceToForm}>
            <FormSelectAsync
              name="invoice_to_id"
              label="Cliente de facturación"
              placeholder="Seleccionar cliente"
              control={invoiceToForm.control}
              useQueryHook={useCustomers}
              mapOptionFn={(customer: CustomersResource) => ({
                value: customer.id.toString(),
                label: `${customer.full_name} - ${customer.num_doc || "S/N"}`,
              })}
              description={
                isInvoiced
                  ? "Ya existe una factura emitida, no se puede modificar"
                  : "Cliente a quien se le emitirá la factura de esta OT"
              }
              perPage={10}
              debounceMs={500}
              disabled={isInvoiced || invoiceToMutation.isPending}
              defaultOption={invoiceToDefaultOption}
              onValueChange={(value) => {
                invoiceToMutation.mutate(value ? Number(value) : null);
              }}
              allowClear={false}
            />
          </FormProvider>

          {/* Info del cliente seleccionado */}
          {workOrder?.invoice_to && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 h-fit">
              <div className="flex-1 grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Nombre
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {workOrder.invoice_to_client?.full_name || "—"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Documento
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {workOrder.invoice_to_client?.document_type || "—"}{" "}
                    {workOrder.invoice_to_client?.num_doc || "S/N"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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

      {/* Add GeneralSheet */}
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
