"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Save,
  Pencil,
  Receipt,
  KeyRound,
  UserCog,
  CheckCircle2,
} from "lucide-react";
import { DetailSheetTable } from "@/shared/components/DetailSheetTable";
import {
  findWorkOrderById,
  updateInvoiceTo,
  updatePickupPerson,
  UpdatePickupPersonData,
  changeAdvisor,
} from "../../lib/workOrder.actions";
import WorkOrderItemForm from "../../../orden-trabajo-item/components/WorkOrderItemForm";
import { deleteWorkOrderItem } from "../../../orden-trabajo-item/lib/workOrderItem.actions";
import { WorkOrderItemResource } from "../../../orden-trabajo-item/lib/workOrderItem.interface";
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
import { CUSTOMERS } from "@/features/ap/comercial/clientes/lib/customers.constants";
import CustomerModal from "@/features/ap/comercial/clientes/components/CustomerModal";
import { FormInput } from "@/shared/components/FormInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import {
  useDniValidation,
  useCeValidation,
} from "@/shared/hooks/useDocumentValidation";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { FormSelect } from "@/shared/components/FormSelect";

const pickupPersonSchema = z.object({
  num_doc_pickup: z
    .string()
    .min(1, "Documento requerido")
    .regex(/^[0-9]{8}([0-9])?$/, "Debe tener 8 (DNI) o 9 (CE) dígitos"),
  full_pickup_name: z.string().min(1, "Nombre requerido"),
  phone_pickup: z
    .string()
    .min(1, "Teléfono requerido")
    .regex(/^[0-9]{9}$/, "Debe tener 9 dígitos"),
});

interface OpeningTabProps {
  workOrderId: number;
  permissions: {
    canChangeAdvisor: boolean;
  };
}

export default function OpeningTab({
  workOrderId,
  permissions,
}: OpeningTabProps) {
  const isTablet = useIsTablet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<WorkOrderItemResource | null>(
    null,
  );
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isEditingAdvisor, setIsEditingAdvisor] = useState(false);
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
      setIsEditingInvoice(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Error al actualizar el cliente de facturación";
      errorToast(message);
    },
  });

  // Formulario mínimo solo para el FormSelect de "Asesor"
  const advisorForm = useForm<{ advisor_id: string }>({
    defaultValues: { advisor_id: "" },
  });

  const { data: asesores = [], isLoading: isLoadingAsesores } = useAllWorkers({
    cargo_id: POSITION_TYPE.SERVICE_ADVISOR,
    status_id: STATUS_WORKER.ACTIVE,
    sede_id: workOrder?.sede_id || undefined,
    sede$empresa_id: EMPRESA_AP.id,
  });

  // Mutación para cambiar el asesor
  const advisorMutation = useMutation({
    mutationFn: (advisorId: number) => changeAdvisor(workOrderId, advisorId),
    onSuccess: () => {
      successToast("Asesor actualizado");
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
      setIsEditingAdvisor(false);
    },
    onError: (error: any) => {
      advisorForm.setValue("advisor_id", String(workOrder?.advisor_id ?? ""), {
        shouldDirty: false,
      });
      const message =
        error?.response?.data?.message || "Error al actualizar el asesor";
      errorToast(message);
    },
  });

  // Si ya existe advisor_id desde el backend, precargar el select
  useEffect(() => {
    advisorForm.setValue("advisor_id", String(workOrder?.advisor_id ?? ""));
  }, [workOrder?.advisor_id, advisorForm]);

  // Formulario para persona que recoge el vehículo
  const pickupForm = useForm<z.infer<typeof pickupPersonSchema>>({
    resolver: zodResolver(pickupPersonSchema),
    defaultValues: {
      num_doc_pickup: "",
      full_pickup_name: "",
      phone_pickup: "",
    },
    mode: "onChange",
  });

  // Mutación para actualizar pickup person
  const pickupMutation = useMutation({
    mutationFn: (data: UpdatePickupPersonData) =>
      updatePickupPerson(workOrderId, data),
    onSuccess: () => {
      successToast("Persona que recoge actualizada");
      queryClient.invalidateQueries({ queryKey: ["workOrder", workOrderId] });
      setIsEditingPickup(false);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Error al actualizar la persona que recoge";
      errorToast(message);
    },
  });

  // Si ya existe datos de pickup desde el backend, precargar el form
  useEffect(() => {
    if (workOrder?.num_doc_pickup) {
      pickupForm.reset({
        num_doc_pickup: workOrder.num_doc_pickup,
        full_pickup_name: workOrder.full_pickup_name ?? "",
        phone_pickup: workOrder.phone_pickup ?? "",
      });
    }
  }, [
    workOrder?.num_doc_pickup,
    workOrder?.full_pickup_name,
    workOrder?.phone_pickup,
    pickupForm,
  ]);

  const watchedNumDocPickup = pickupForm.watch("num_doc_pickup");
  const isDniPickup = watchedNumDocPickup?.length === 8;
  const isCePickup = watchedNumDocPickup?.length === 9;

  const {
    data: dniPickupData,
    isLoading: isDniPickupLoading,
    error: dniPickupError,
  } = useDniValidation(watchedNumDocPickup, Boolean(isDniPickup));

  const {
    data: cePickupData,
    isLoading: isCePickupLoading,
    error: cePickupError,
  } = useCeValidation(watchedNumDocPickup, Boolean(isCePickup));

  // Datos consolidados
  const pickupData = dniPickupData || cePickupData;
  const pickupError = dniPickupError || cePickupError;
  const isPickupLoading = isDniPickupLoading || isCePickupLoading;

  useEffect(() => {
    if (pickupData?.data && pickupData.success && pickupData.data.valid) {
      pickupForm.setValue("full_pickup_name", pickupData.data.names, {
        shouldValidate: true,
      });
    }
  }, [pickupData, pickupForm]);

  const handlePickupSubmit = (data: z.infer<typeof pickupPersonSchema>) => {
    pickupMutation.mutate(data);
  };

  const handleCancelPickupEdit = () => {
    pickupForm.reset({
      num_doc_pickup: workOrder?.num_doc_pickup ?? "",
      full_pickup_name: workOrder?.full_pickup_name ?? "",
      phone_pickup: workOrder?.phone_pickup ?? "",
    });
    setIsEditingPickup(false);
  };

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
      await downloadOrderReceiptPdf(
        workOrderId,
        workOrder?.correlative || "N/A",
      );
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

  const handleEditItem = (item: WorkOrderItemResource) => {
    setItemToEdit(item);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setItemToEdit(null);
  };

  const handleEditCancel = () => {
    setItemToEdit(null);
  };

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
        <DetailSheetTable
          rows={items}
          getKey={(item) => item.id}
          columns={[
            {
              header: "Planificación",
              render: (item) => (
                <div className="text-xs sm:text-sm text-gray-900 max-w-xs line-clamp-2">
                  {item.type_planning.description}
                </div>
              ),
            },
            {
              header: "Operación",
              render: (item) => (
                <div className="text-xs sm:text-sm text-gray-900 max-w-xs line-clamp-2">
                  {item.type_operation_name}
                </div>
              ),
            },
            {
              header: "Descripción",
              render: (item) => (
                <div className="text-xs sm:text-sm text-gray-900 max-w-xs line-clamp-2">
                  {item.description}
                </div>
              ),
            },
            {
              header: "Acciones",
              render: (item) => (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleEditItem(item)}
                  tooltip="Editar trabajo"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              ),
            },
          ]}
        />
      )}

      {/* Datos de la Orden */}
      <div className="divide-y divide-gray-200 md:flex md:divide-y-0 md:divide-x md:divide-gray-200">
        {/* Bloque: Facturar a */}
        <div className="py-6 first:pt-0 last:pb-0 md:flex-1 md:py-0 md:px-6 md:first:pl-0 md:last:pr-0 min-w-0">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 flex-1 min-w-0">
              Facturar a
            </h4>
            {isInvoiced && (
              <Badge color="green" size="sm" className="shrink-0 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Facturado
              </Badge>
            )}
          </div>

          {isEditingInvoice ? (
            <FormProvider {...invoiceToForm}>
              <div className="flex flex-col gap-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 min-w-0">
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
                      perPage={10}
                      debounceMs={500}
                      disabled={invoiceToMutation.isPending}
                      defaultOption={invoiceToDefaultOption}
                      onValueChange={(value) => {
                        invoiceToMutation.mutate(value ? Number(value) : null);
                      }}
                      allowClear={false}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="aspect-square shrink-0"
                    onClick={() => setIsCustomerModalOpen(true)}
                    tooltip="Agregar nuevo cliente"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingInvoice(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </FormProvider>
          ) : workOrder?.invoice_to ? (
            <div className="flex flex-col gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {workOrder.invoice_to_client?.full_name || "—"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {workOrder.invoice_to_client?.document_type || "Doc."}{" "}
                  {workOrder.invoice_to_client?.num_doc || "S/N"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                disabled={
                  isInvoiced ||
                  (workOrder?.payment_summary?.paid_amount ?? 0) > 0
                }
                tooltip={
                  isInvoiced
                    ? "Ya existe una factura emitida, no se puede modificar"
                    : (workOrder?.payment_summary?.paid_amount ?? 0) > 0
                      ? "Ya existe un monto facturado, no se puede modificar"
                      : undefined
                }
                onClick={() => setIsEditingInvoice(true)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Editar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-400">Sin cliente asignado</p>
              <Button
                type="button"
                size="sm"
                className="self-start"
                disabled={isInvoiced}
                tooltip={
                  isInvoiced
                    ? "Ya existe una factura emitida, no se puede modificar"
                    : undefined
                }
                onClick={() => setIsEditingInvoice(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Asignar
              </Button>
            </div>
          )}
        </div>

        {/* Bloque: Persona que recoge el vehículo */}
        <div className="py-6 first:pt-0 last:pb-0 md:flex-1 md:py-0 md:px-6 md:first:pl-0 md:last:pr-0 min-w-0">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <KeyRound className="h-4 w-4 text-primary" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 flex-1 min-w-0">
              Recogerá el Vehículo
            </h4>
          </div>

          {isEditingPickup ? (
            <Form {...pickupForm}>
              <form onSubmit={pickupForm.handleSubmit(handlePickupSubmit)}>
                <div className="flex flex-col gap-3">
                  <FormInput
                    name="num_doc_pickup"
                    label={
                      <>
                        <span>DNI/CE</span>
                        <DocumentValidationStatus
                          shouldValidate={true}
                          documentNumber={watchedNumDocPickup!}
                          expectedDigits={isCePickup ? 9 : 8}
                          isValidating={isPickupLoading}
                          leftPosition=""
                        />
                      </>
                    }
                    labelClassName="w-full justify-between gap-2"
                    placeholder="8 (DNI) o 9 (CE) dígitos"
                    maxLength={9}
                    control={pickupForm.control}
                    addonEnd={
                      <ValidationIndicator
                        show={!!watchedNumDocPickup}
                        isValidating={isPickupLoading}
                        isValid={pickupData?.success && !!pickupData.data}
                        hasError={
                          !!pickupError || (pickupData && !pickupData.success)
                        }
                        positioned={false}
                      />
                    }
                  />
                  <FormInput
                    name="full_pickup_name"
                    label="Nombre Completo"
                    placeholder="Nombre del receptor"
                    control={pickupForm.control}
                    disabled={pickupData?.success && pickupData.data?.valid}
                  />
                  <FormInput
                    name="phone_pickup"
                    label="Teléfono"
                    placeholder="987654321"
                    maxLength={9}
                    control={pickupForm.control}
                  />
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelPickupEdit}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      pickupMutation.isPending || !pickupForm.formState.isValid
                    }
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {pickupMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : workOrder?.num_doc_pickup ? (
            <div className="flex flex-col gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {workOrder.full_pickup_name || "—"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {workOrder.num_doc_pickup.length === 9 ? "CE" : "DNI"}{" "}
                  {workOrder.num_doc_pickup} · {workOrder.phone_pickup || "—"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setIsEditingPickup(true)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Editar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-400">Sin persona asignada</p>
              <Button
                type="button"
                size="sm"
                className="self-start"
                onClick={() => setIsEditingPickup(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Asignar
              </Button>
            </div>
          )}
        </div>

        {/* Bloque: Asesor */}
        {permissions.canChangeAdvisor && (
          <div className="py-6 first:pt-0 last:pb-0 md:flex-1 md:py-0 md:px-6 md:first:pl-0 md:last:pr-0 min-w-0">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <UserCog className="h-4 w-4 text-primary" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 flex-1 min-w-0">
                Asesor
              </h4>
            </div>

            {isEditingAdvisor ? (
              <FormProvider {...advisorForm}>
                <div className="flex flex-col gap-3">
                  <FormSelect
                    name="advisor_id"
                    label="Asesor"
                    placeholder="Seleccionar asesor"
                    control={advisorForm.control}
                    options={asesores.map((worker) => ({
                      value: String(worker.id),
                      label: worker.name,
                    }))}
                    isLoadingOptions={isLoadingAsesores}
                    disabled={advisorMutation.isPending}
                    onValueChange={(value) => {
                      const parsedAdvisorId = Number(value);

                      if (
                        !parsedAdvisorId ||
                        parsedAdvisorId === Number(workOrder?.advisor_id)
                      ) {
                        return;
                      }

                      advisorMutation.mutate(parsedAdvisorId);
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingAdvisor(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </FormProvider>
            ) : workOrder?.advisor_name ? (
              <div className="flex flex-col gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {workOrder.advisor_name}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() => setIsEditingAdvisor(true)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Editar
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">Sin asesor asignado</p>
                <Button
                  type="button"
                  size="sm"
                  className="self-start"
                  onClick={() => setIsEditingAdvisor(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Asignar
                </Button>
              </div>
            )}
          </div>
        )}
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

      {/* Edit GeneralSheet */}
      <GeneralSheet
        open={!!itemToEdit}
        onClose={handleEditCancel}
        title="Editar Servicio"
        type={isTablet ? "tablet" : "default"}
        className="sm:max-w-2xl"
      >
        {itemToEdit && (
          <WorkOrderItemForm
            workOrderId={workOrderId}
            defaultGroupNumber={defaultGroupNumber}
            item={itemToEdit}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        )}
      </GeneralSheet>

      <CustomerModal
        open={isCustomerModalOpen}
        onClose={(newCustomer) => {
          setIsCustomerModalOpen(false);
          if (newCustomer) {
            queryClient.invalidateQueries({ queryKey: [CUSTOMERS.QUERY_KEY] });
          }
        }}
        title="Agregar Nuevo Cliente"
      />

      {/* Delete Confirmation Drawer */}
      <SimpleDeleteDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
