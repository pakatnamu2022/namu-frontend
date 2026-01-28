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
  Receipt,
  UserCog,
  Package,
  FileText,
  Paperclip,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  downloadPreLiquidationPdf,
  findWorkOrderById,
  updateWorkOrder,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import { WORKER_ORDER } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import LaborTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/LaborTab";
import ReceptionTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/ReceptionTab";
import OpeningTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/OpeningTab";
import BillingTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/BillingTab";
import OperatorsTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/OperatorsTab";
import PartsTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/PartsTab";
import { WorkOrderProvider } from "@/features/ap/post-venta/taller/orden-trabajo/contexts/WorkOrderContext";
import { WorkOrderQuotationSelectionModal } from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderQuotationSelectionModal";
import { useParams, useNavigate } from "react-router-dom";
import { successToast, errorToast } from "@/core/core.function";

export default function ManageWorkOrderPage() {
  const params = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const id = Number(params.id);
  const [activeTab, setActiveTab] = useState("reception");
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { ABSOLUTE_ROUTE } = WORKER_ORDER;

  // Fetch work order data
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: () => findWorkOrderById(id),
    enabled: !!id,
  });

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

  const handleDownloadPdf = async () => {
    if (!workOrder?.id) return;

    try {
      setIsDownloading(true);
      await downloadPreLiquidationPdf(workOrder.id);
      successToast("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      errorToast("Error al descargar el PDF de la preliquidación");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectQuotation = (quotationId: number) => {
    attachQuotationMutation.mutate(quotationId);
  };

  // Verificar si ya tiene cotización adjuntada
  const hasQuotation = workOrder?.order_quotation_id !== null;

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
                    #: {workOrder.correlative} - Placa:{" "}
                    {workOrder.vehicle_plate}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end">
                <span className="text-xs text-gray-500 mb-1">Estado</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap">
                  {workOrder.status.description}
                </span>
              </div>
            </div>

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
              {!hasQuotation && (
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
              )}
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
              <TabsList className="inline-flex w-auto min-w-full lg:w-full lg:grid lg:grid-cols-6 gap-1">
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
                  value="billing"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Receipt className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Facturación</span>
                  <span className="sm:hidden">Factura</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value="reception" className="space-y-4">
                <ReceptionTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="opening" className="space-y-4">
                <OpeningTab workOrderId={workOrder.id} />
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

              <TabsContent value="billing" className="space-y-4">
                <BillingTab workOrderId={workOrder.id} />
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
