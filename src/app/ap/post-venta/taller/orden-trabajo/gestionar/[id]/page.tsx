"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Wrench,
  ClipboardCheck,
  FolderOpen,
  UserCog,
  Package,
  FileText,
  Paperclip,
  Unlink,
  Ban,
  User,
  UserRoundCheck,
  Receipt,
  Files,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  downloadPreLiquidationPdf,
  findWorkOrderById,
  updateWorkOrder,
  unlinkQuotation,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import {
  WORK_ORDER_STATUS_COLORS,
  WORKER_ORDER,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import LaborTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/LaborTab";
import ReceptionTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/ReceptionTab";
import OpeningTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/OpeningTab";
import OperatorsTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/OperatorsTab";
import PartsTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/PartsTab";
import DocumentsTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/DocumentsTab";
import { WorkOrderProvider } from "@/features/ap/post-venta/taller/orden-trabajo/contexts/WorkOrderContext";
import { WorkOrderQuotationSelectionModal } from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderQuotationSelectionModal";
import { WorkOrderDeductibleAction } from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderDeductibleAction";
import { useParams, useNavigate } from "react-router-dom";
import {
  successToast,
  errorToast,
  formatDateTime,
  formatMoney,
} from "@/core/core.function";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { Badge } from "@/components/ui/badge";
import { CopyCell } from "@/shared/components/CopyCell";

export default function ManageWorkOrderPage() {
  const params = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const id = Number(params.id);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { ABSOLUTE_ROUTE, ROUTE } = WORKER_ORDER;
  const permissions = useModulePermissions(ROUTE);

  // Determinar el tab inicial según los permisos
  const initialTab = permissions.canOtOptions
    ? "reception"
    : permissions.canBill
      ? "billing"
      : "reception";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Fetch work order data
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: () => findWorkOrderById(id),
    enabled: !!id,
  });

  const color = WORK_ORDER_STATUS_COLORS[workOrder?.status.id || 0] ?? "gray";

  // Mutación para adjuntar cotización
  const attachQuotationMutation = useMutation({
    mutationFn: (quotationId: number) =>
      updateWorkOrder(id, {
        vehicle_id: workOrder?.vehicle_id || "",
        order_quotation_id: quotationId,
      } as any),
    onSuccess: () => {
      successToast("Cotización adjuntada exitosamente a la orden de trabajo");
      queryClient.invalidateQueries({
        queryKey: ["workOrder", id],
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al adjuntar la cotización");
    },
  });

  // Mutación para desasociar cotización
  const unlinkQuotationMutation = useMutation({
    mutationFn: () => unlinkQuotation(id),
    onSuccess: () => {
      successToast("Cotización desasociada exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrder", id],
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al desasociar la cotización");
    },
  });

  const handleDownloadPdf = async () => {
    if (!workOrder?.id) return;

    try {
      setIsDownloading(true);
      await downloadPreLiquidationPdf(workOrder.id);
      successToast("PDF descargado exitosamente");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ||
          "La orden de trabajo no tiene un destinatario de factura asignado.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectQuotation = (quotationId: number) => {
    attachQuotationMutation.mutate(quotationId);
  };

  // Verificar si ya tiene cotización adjuntada
  const hasQuotation = workOrder?.order_quotation_id !== null;
  const isCancelled = !!workOrder?.discarded_at;

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Orden de trabajo no encontrada</p>
      </div>
    );
  }

  return (
    <WorkOrderProvider>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {/* Primera fila: Botón volver, título y estado */}
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router(ABSOLUTE_ROUTE)}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl font-bold truncate">
                    Gestión de Orden de Trabajo
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 font-bold truncate">
                    {workOrder.correlative} - Placa: {workOrder.vehicle_plate}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-wrap items-start gap-4">
                {workOrder.type_currency && (
                  <div className="flex flex-col items-end">
                    <p className="text-xs text-gray-500 mb-1">Moneda</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 whitespace-nowrap">
                      {workOrder.type_currency.symbol} —{" "}
                      {workOrder.type_currency.name}
                    </span>
                    {String(workOrder.type_currency.id) ===
                      CURRENCY_TYPE_IDS.DOLLARS && (
                      <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                        TC: S/ {workOrder.exchange_rate?.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 mb-1">Estado</span>
                  <Badge variant="outline" color={color}>
                    {workOrder.status.description}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Banner de anulación */}
            {isCancelled && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <Ban className="h-4 w-4 mt-0.5 shrink-0 text-red-600" />
                <div className="space-y-1">
                  <p className="font-semibold">Orden anulada</p>
                  {workOrder.discard_reason && (
                    <p>
                      <span className="font-medium">Motivo:</span>{" "}
                      {workOrder.discard_reason}
                    </p>
                  )}
                  {workOrder.discarded_note && (
                    <p>
                      <span className="font-medium">Nota:</span>{" "}
                      {workOrder.discarded_note}
                    </p>
                  )}
                  {workOrder.discarded_by_name && (
                    <p>
                      <span className="font-medium">Anulado por:</span>{" "}
                      {workOrder.discarded_by_name}
                    </p>
                  )}
                  {workOrder.discarded_at && (
                    <p>
                      <span className="font-medium">Fecha:</span>{" "}
                      {formatDateTime(workOrder.discarded_at)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Segunda fila: Botones de acción */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                size="sm"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isDownloading ? "Generando..." : "Preliquidación"}
                </span>
                <span className="sm:hidden">
                  {isDownloading ? "..." : "Preliq."}
                </span>
              </Button>
              {!isCancelled &&
              !hasQuotation &&
              workOrder.status.description !== "CERRADO" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuotationModalOpen(true)}
                  className="gap-2"
                  disabled={attachQuotationMutation.isPending}
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="hidden sm:inline">Adjuntar Cotización</span>
                  <span className="sm:hidden">Cotización</span>
                </Button>
              ) : !isCancelled && hasQuotation ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unlinkQuotationMutation.mutate()}
                  className="gap-2"
                  disabled={unlinkQuotationMutation.isPending}
                >
                  <Unlink className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Desasociar Cotización
                  </span>
                  <span className="sm:hidden">Desasociar</span>
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router(
                    `/ap/post-venta/taller/orden-trabajo/gestionar/${id}/informacion-general`,
                  )
                }
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Información General</span>
                <span className="sm:hidden">Info. Gen.</span>
              </Button>
            </div>

            {/* Información de propietario, contacto, recojo y facturación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="flex items-start gap-2 rounded-md border border-muted bg-muted/20 p-2.5">
                <User className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">
                    Propietario
                  </p>
                  <CopyCell
                    className="text-sm font-medium truncate"
                    value={workOrder.vehicle?.owner?.full_name || "—"}
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    {workOrder.vehicle?.owner?.num_doc && (
                      <CopyCell
                        className="truncate text-xs text-gray-500"
                        value={workOrder.vehicle.owner.num_doc}
                        label={`DNI: ${workOrder.vehicle.owner.num_doc}`}
                      />
                    )}
                    {workOrder.vehicle?.owner?.phone && (
                      <CopyCell
                        className="truncate text-xs text-gray-500"
                        value={workOrder.vehicle.owner.phone}
                        label={workOrder.vehicle.owner.phone}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md border border-muted bg-muted/20 p-2.5">
                <ClipboardCheck className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">
                    Entregó el vehículo
                  </p>
                  <CopyCell
                    className="text-sm font-medium truncate"
                    value={workOrder.full_contact_name || ""}
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    {workOrder.num_doc_contact && (
                      <CopyCell
                        className="truncate text-xs text-gray-500"
                        value={workOrder.num_doc_contact}
                        label={`DNI: ${workOrder.num_doc_contact}`}
                      />
                    )}
                    {workOrder.phone_contact && (
                      <CopyCell
                        className="truncate text-xs text-gray-500"
                        value={workOrder.phone_contact}
                        label={workOrder.phone_contact}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md border border-muted bg-muted/20 p-2.5">
                <UserRoundCheck className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">
                    Recogerá el vehículo
                  </p>
                  <CopyCell
                    className="text-sm font-medium truncate"
                    value={workOrder.full_pickup_name || "—"}
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    {workOrder.num_doc_pickup && (
                      <CopyCell
                        className="truncate text-xs text-gray-500"
                        value={workOrder.num_doc_pickup}
                        label={`DNI: ${workOrder.num_doc_pickup}`}
                      />
                    )}
                    {workOrder.phone_pickup && (
                      <CopyCell
                        className="truncate text-xs text-gray-500"
                        value={workOrder.phone_pickup}
                        label={workOrder.phone_pickup}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md border border-muted bg-muted/20 p-2.5">
                <Receipt className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 leading-tight">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">
                    Se factura a
                  </p>
                  <CopyCell
                    className="text-sm font-medium truncate"
                    value={workOrder.invoice_to_client?.full_name || "—"}
                  />
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    {workOrder.invoice_to_client?.num_doc && (
                      <CopyCell
                        className="truncate text-xs text-gray-500"
                        value={workOrder.invoice_to_client.num_doc}
                        label={`DNI: ${workOrder.invoice_to_client.num_doc}`}
                      />
                    )}
                    {workOrder.invoice_to_client?.phone && (
                      <CopyCell
                        className="truncate text-xs text-gray-500"
                        value={workOrder.invoice_to_client.phone}
                        label={workOrder.invoice_to_client.phone}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Monto total y deducible */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-muted bg-muted/20 p-2.5">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 shrink-0 text-primary" />
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase">
                    Monto Total
                  </p>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatMoney(
                      workOrder.final_amount,
                      2,
                      workOrder.type_currency?.symbol || "S/",
                    )}
                  </span>
                </div>
              </div>
              {!isCancelled && (
                <WorkOrderDeductibleAction
                  workOrderId={workOrder.id}
                  deductibleId={workOrder.deductible_id}
                  sedeId={workOrder.sede_id}
                  currencyId={workOrder.type_currency?.id}
                  currencySymbol={workOrder.type_currency?.symbol}
                  deductibleAmount={workOrder.deductible_amount}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide -mx-6 px-6">
              <TabsList className="inline-flex w-auto min-w-full lg:w-full lg:grid lg:grid-cols-7 gap-1">
                {permissions.canOtOptions && (
                  <>
                    <TabsTrigger
                      value="reception"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <ClipboardCheck className="h-4 w-4 shrink-0" />
                      <span>Recepción</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="opening"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <FolderOpen className="h-4 w-4 shrink-0" />
                      <span>Apertura</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="operators"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <UserCog className="h-4 w-4 shrink-0" />
                      <span>Operarios</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="labor"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Wrench className="h-4 w-4 shrink-0" />
                      <span className="hidden md:inline">Mano de Obra</span>
                      <span className="md:hidden">M. Obra</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="parts"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Package className="h-4 w-4 shrink-0" />
                      <span>Repuestos</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="documents"
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Files className="h-4 w-4 shrink-0" />
                      <span>Archivos</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value="reception" className="space-y-4">
                <ReceptionTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="opening" className="space-y-4">
                <OpeningTab
                  workOrderId={workOrder.id}
                  permissions={permissions}
                />
              </TabsContent>

              <TabsContent value="operators" className="space-y-4">
                <OperatorsTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="labor" className="space-y-4">
                <LaborTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="parts" className="space-y-4">
                <PartsTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <DocumentsTab workOrderId={workOrder.id} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>

        {/* Modal de selección de cotización */}
        <WorkOrderQuotationSelectionModal
          open={isQuotationModalOpen}
          onOpenChange={setIsQuotationModalOpen}
          onSelectQuotation={handleSelectQuotation}
          vehicleId={workOrder?.vehicle_id}
        />
      </div>
    </WorkOrderProvider>
  );
}
