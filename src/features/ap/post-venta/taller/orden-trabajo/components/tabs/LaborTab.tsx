"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Plus,
  Trash2,
  FileText,
  Tag,
  Pencil,
  CheckCircle,
  XCircle,
  Percent,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetConsolidatedWorkers } from "../../../planificacion-orden-trabajo/lib/workOrderPlanning.hook";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import { ITEM_TYPE_LABOR } from "../../../cotizacion-detalle/lib/proformaDetails.constants";
import { useDiscountRequestsByWorkOrder } from "../../../descuento-cotizacion-taller/lib/discountRequestTaller.hook";
import { DiscountRequestWorkOrderModal } from "../../../descuento-cotizacion-taller/components/DiscountRequestWorkOrderModal";
import {
  approveDiscountRequestWorkOrderQuotation,
  rejectDiscountRequestWorkOrderQuotation,
} from "../../../descuento-cotizacion-taller/lib/discountRequestTaller.actions";
import {
  DISCOUNT_REQUEST_TALLER,
  TYPE_GLOBAL,
  TYPE_PARTIAL,
  MODEL_LABOUR,
} from "../../../descuento-cotizacion-taller/lib/discountRequestTaller.constants";
import { DiscountRequestWorkOrderQuotationResource } from "../../../descuento-cotizacion-taller/lib/discountRequestTaller.interface";
import { errorToast, successToast } from "@/core/core.function";

interface LaborTabProps {
  workOrderId: number;
}

export default function LaborTab({ workOrderId }: LaborTabProps) {
  const [showForm, setShowForm] = useState(false);
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Modal de descuento
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"GLOBAL" | "PARTIAL">(TYPE_PARTIAL);
  const [selectedLabour, setSelectedLabour] = useState<any | null>(null);
  const [editingRequest, setEditingRequest] =
    useState<DiscountRequestWorkOrderQuotationResource | null>(null);

  const { data: labours = [], isLoading } = useGetAllWorkOrderLabour({
    work_order_id: workOrderId,
  });

  const { data: workOrder, isLoading: isLoadingWorkOrder } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  const items = useMemo(() => workOrder?.items || [], [workOrder?.items]);

  const associatedQuotation = workOrder?.order_quotation || null;
  const hasAssociatedQuotation = workOrder?.order_quotation_id !== null;

  const laborItems = useMemo(() => {
    if (!associatedQuotation?.details) return [];
    return associatedQuotation.details.filter(
      (detail: any) => detail.item_type === ITEM_TYPE_LABOR,
    );
  }, [associatedQuotation]);

  const {
    data: consolidatedWorkers = [],
    isLoading: isLoadingConsolidatedWorkers,
  } = useGetConsolidatedWorkers(workOrderId);

  // Solicitudes de descuento de la OT — solo las de LABOUR
  const { data: allDiscountRequests = [] } =
    useDiscountRequestsByWorkOrder(workOrderId);
  const discountRequests = allDiscountRequests.filter(
    (r) => r.item_type === "LABOR",
  );

  const updateGroupMutation = useUpdateWorkOrderLabour();

  const handleWorkerChange = (labour: any, newWorkerId: number) => {
    updateGroupMutation.mutate({
      id: labour.id,
      data: {
        description: labour.description,
        time_spent: labour.time_spent,
        hourly_rate: labour.hourly_rate,
        discount_percentage: labour.discount_percentage,
        work_order_id: labour.work_order_id,
        worker_id: newWorkerId,
        group_number: labour.group_number,
      },
    });
  };

  useEffect(() => {
    if (items.length > 0 && selectedGroupNumber === null) {
      const firstGroup = Math.min(...items.map((i) => i.group_number));
      setSelectedGroupNumber(firstGroup);
    }
  }, [items, selectedGroupNumber, setSelectedGroupNumber]);

  const filteredLabours = labours.filter(
    (labour) => labour.group_number === selectedGroupNumber,
  );

  const deleteMutation = useDeleteWorkOrderLabour();

  const handleSuccess = () => {
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  // --- Lógica global/partial ---
  const globalRequest = discountRequests.find((r) => r.type === TYPE_GLOBAL);
  const hasPartialRequests = discountRequests.some(
    (r) => r.type === TYPE_PARTIAL,
  );
  const hasMultipleItems = filteredLabours.length > 1;

  const getPartialRequest = (labourId: number) =>
    discountRequests.find(
      (r) =>
        r.type === TYPE_PARTIAL &&
        r.part_labour_id === labourId &&
        r.part_labour_model === MODEL_LABOUR,
    );

  // Total de las manos de obra filtradas (base para el global)
  const globalBaseAmount = filteredLabours.reduce(
    (acc, l) => acc + parseFloat(l.total_cost || "0"),
    0,
  );

  const handleOpenCreate = (type: "GLOBAL" | "PARTIAL", labour?: any) => {
    setEditingRequest(null);
    setModalType(type);
    setSelectedLabour(labour ?? null);
    setModalOpen(true);
  };

  const handleOpenEdit = (
    request: DiscountRequestWorkOrderQuotationResource,
    labour?: any,
  ) => {
    setEditingRequest(request);
    setModalType(request.type);
    setSelectedLabour(labour ?? null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLabour(null);
    setEditingRequest(null);
  };

  const { mutate: doApprove, isPending: isApproving } = useMutation({
    mutationFn: approveDiscountRequestWorkOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud aprobada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_TALLER.QUERY_KEY, "work-order", workOrderId],
      });
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al aprobar la solicitud",
      );
    },
  });

  const { mutate: doReject, isPending: isRejecting } = useMutation({
    mutationFn: rejectDiscountRequestWorkOrderQuotation,
    onSuccess: () => {
      successToast("Solicitud rechazada correctamente");
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_TALLER.QUERY_KEY, "work-order", workOrderId],
      });
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al rechazar la solicitud",
      );
    },
  });

  const renderStatusBadge = (status: string) => (
    <Badge
      color={
        status === "approved" ? "green" : status === "rejected" ? "red" : "orange"
      }
      className="text-xs"
    >
      {status === "approved"
        ? "Aprobado"
        : status === "rejected"
          ? "Rechazado"
          : "Pendiente"}
    </Badge>
  );

  if (isLoading || isLoadingWorkOrder) {
    return (
      <Card className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-500">Cargando mano de obra...</p>
        </div>
      </Card>
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

      {/* Información de Mano de Obra de la Cotización (Compacta) */}
      {hasAssociatedQuotation && laborItems.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200 gap-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary">
                  Cotización {associatedQuotation!.quotation_number}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {associatedQuotation!.quotation_date && (
                    <span>
                      {new Date(
                        associatedQuotation!.quotation_date,
                      ).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      •{" "}
                    </span>
                  )}
                  Mano de obra asociada
                </p>
              </div>
            </div>
            {associatedQuotation!.type_currency?.id !==
              Number(CURRENCY_TYPE_IDS.SOLES) && (
              <div className="px-3 py-1.5 bg-white rounded-md border border-blue-300 shadow-sm">
                <p className="text-xs text-muted-foreground">Tipo de cambio</p>
                <p className="text-sm font-bold text-primary">
                  {associatedQuotation!.exchange_rate || "N/A"}
                </p>
              </div>
            )}
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[600px] sm:min-w-0">
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-3 py-2 border-b-2 border-blue-200">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 shrink-0"></span>
                    <span className="text-xs font-semibold text-gray-600">
                      Descripción
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 whitespace-nowrap">
                    <span className="text-center min-w-[60px]">Horas</span>
                    <span className="w-3"></span>
                    <span className="text-left min-w-20">Precio/Hora</span>
                    <span className="text-center min-w-[60px]">Desc.</span>
                    <span className="w-3"></span>
                    <span className="text-left min-w-20">Total</span>
                  </div>
                </div>

                {laborItems.map((item: any, index: number) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-1 border-b border-blue-100 last:border-0"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 truncate">
                        {item.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-medium whitespace-nowrap">
                      <span className="text-center min-w-[60px]">
                        {Number(item.quantity || 0).toFixed(2)} hrs
                      </span>
                      <span className="text-muted-foreground w-3 text-center">
                        x
                      </span>
                      <span className="text-left min-w-20">
                        {associatedQuotation!.type_currency?.symbol || "S/"}{" "}
                        {Number(item.unit_price || 0).toFixed(2)}
                      </span>
                      <span className="text-center min-w-[60px]">
                        - {Number(item.discount_percentage || 0).toFixed(2)}%
                      </span>
                      <span className="text-muted-foreground w-3 text-center">
                        =
                      </span>
                      <span className="text-left min-w-20">
                        {associatedQuotation!.type_currency?.symbol || "S/"}{" "}
                        {Number(item.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Add Labor Button */}
      {!showForm && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2"
            disabled={items.length === 0}
          >
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
            workOrderItems={items}
            currencySymbol={
              associatedQuotation?.type_currency?.symbol ||
              workOrder?.type_currency?.symbol ||
              "S/"
            }
          />
        </Card>
      )}

      {/* Labor List Table */}
      <Card className="p-6">
        {/* Header con botón descuento global */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-lg font-semibold">Mano de Obra Registrada</h3>

          {hasMultipleItems && filteredLabours.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {globalRequest ? (
                <div className="flex items-center gap-2 text-sm border rounded-md px-3 py-1.5">
                  <span className="text-muted-foreground text-xs">
                    Desc. global:
                  </span>
                  <span className="font-semibold">
                    {Number(globalRequest.requested_discount_percentage).toFixed(2)}%
                  </span>
                  {renderStatusBadge(globalRequest.status)}
                  {globalRequest.status === "pending" && (
                    <>
                      <ConfirmationDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7 text-green-600 hover:text-green-600 hover:bg-green-50"
                            tooltip="Aprobar solicitud global"
                            disabled={isApproving}
                          >
                            <CheckCircle className="size-4" />
                          </Button>
                        }
                        title="¿Aprobar solicitud?"
                        description="Se aprobará el descuento global para la mano de obra. ¿Deseas continuar?"
                        confirmText="Sí, aprobar"
                        cancelText="Cancelar"
                        icon="info"
                        onConfirm={() => doApprove(globalRequest.id)}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        tooltip="Editar solicitud global"
                        onClick={() => handleOpenEdit(globalRequest)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmationDialog
                        trigger={
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            tooltip="Rechazar solicitud global"
                            disabled={isRejecting}
                          >
                            <XCircle className="size-4" />
                          </Button>
                        }
                        title="¿Rechazar solicitud?"
                        description="Se rechazará el descuento global para la mano de obra. ¿Deseas continuar?"
                        confirmText="Sí, rechazar"
                        cancelText="Cancelar"
                        variant="destructive"
                        icon="danger"
                        onConfirm={() => doReject(globalRequest.id)}
                      />
                    </>
                  )}
                </div>
              ) : (
                !hasPartialRequests && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenCreate(TYPE_GLOBAL)}
                    className="gap-2"
                  >
                    <Percent className="size-4" />
                    Desc. global
                  </Button>
                )
              )}
            </div>
          )}
        </div>

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
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Costo Total</TableHead>
                  <TableHead className="text-center w-40">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLabours.map((labour) => {
                  const partialRequest = getPartialRequest(labour.id);
                  return (
                    <TableRow key={labour.id}>
                      <TableCell className="max-w-md">
                        <div className="line-clamp-2">{labour.description}</div>
                      </TableCell>
                      <TableCell className="text-left">
                        <Select
                          value={labour.worker_id?.toString() || ""}
                          onValueChange={(value) =>
                            handleWorkerChange(labour, Number(value))
                          }
                          disabled={isLoadingConsolidatedWorkers}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {consolidatedWorkers.map((worker) => (
                              <SelectItem
                                key={worker.worker_id}
                                value={worker.worker_id.toString()}
                              >
                                {worker.worker_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        {labour.time_spent}
                      </TableCell>
                      <TableCell className="text-right">
                        {workOrder?.type_currency?.symbol || "S/"}{" "}
                        {labour.hourly_rate}
                      </TableCell>
                      <TableCell className="text-right text-orange-600">
                        -{labour.discount_percentage}%
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {workOrder?.type_currency?.symbol || "S/"}{" "}
                        {labour.total_cost}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Columna de descuento parcial: solo si no hay global */}
                          {!globalRequest && (
                            <>
                              {partialRequest ? (
                                <>
                                  {renderStatusBadge(partialRequest.status)}
                                  {partialRequest.status === "pending" && (
                                    <>
                                      <ConfirmationDialog
                                        trigger={
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-green-600 hover:text-green-600 hover:bg-green-50"
                                            tooltip="Aprobar solicitud"
                                            disabled={isApproving}
                                          >
                                            <CheckCircle className="h-4 w-4" />
                                          </Button>
                                        }
                                        title="¿Aprobar solicitud?"
                                        description="Se aprobará el descuento solicitado para esta mano de obra. ¿Deseas continuar?"
                                        confirmText="Sí, aprobar"
                                        cancelText="Cancelar"
                                        icon="info"
                                        onConfirm={() =>
                                          doApprove(partialRequest.id)
                                        }
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        tooltip="Editar solicitud"
                                        onClick={() =>
                                          handleOpenEdit(partialRequest, labour)
                                        }
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <ConfirmationDialog
                                        trigger={
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            tooltip="Rechazar solicitud"
                                            disabled={isRejecting}
                                          >
                                            <XCircle className="h-4 w-4" />
                                          </Button>
                                        }
                                        title="¿Rechazar solicitud?"
                                        description="Se rechazará el descuento solicitado para esta mano de obra. ¿Deseas continuar?"
                                        confirmText="Sí, rechazar"
                                        cancelText="Cancelar"
                                        variant="destructive"
                                        icon="danger"
                                        onConfirm={() =>
                                          doReject(partialRequest.id)
                                        }
                                      />
                                    </>
                                  )}
                                </>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10"
                                  tooltip="Solicitar descuento parcial"
                                  onClick={() =>
                                    handleOpenCreate(TYPE_PARTIAL, labour)
                                  }
                                >
                                  <Tag className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(labour.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Total */}
            <div className="flex justify-end mt-4 pt-4 border-t">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Mano de Obra:</p>
                <p className="text-xl font-bold">
                  {workOrder?.type_currency?.symbol || "S/"}{" "}
                  {filteredLabours
                    .reduce(
                      (acc, labour) =>
                        acc + parseFloat(labour.total_cost || "0"),
                      0,
                    )
                    .toFixed(2)}
                </p>
              </div>
            </div>
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

      {/* Modal Solicitar Descuento */}
      <DiscountRequestWorkOrderModal
        open={modalOpen}
        onClose={handleCloseModal}
        type={modalType}
        workOrderId={workOrderId}
        baseAmount={
          modalType === TYPE_GLOBAL
            ? globalBaseAmount
            : parseFloat(selectedLabour?.total_cost || "0")
        }
        partLabourId={
          modalType === TYPE_PARTIAL ? selectedLabour?.id : undefined
        }
        partLabourModel={modalType === TYPE_PARTIAL ? MODEL_LABOUR : undefined}
        itemDescription={
          modalType === TYPE_PARTIAL ? selectedLabour?.description : undefined
        }
        currencySymbol={workOrder?.type_currency?.symbol || "S/"}
        existingRequest={editingRequest ?? undefined}
        itemType="LABOR"
      />
    </div>
  );
}
