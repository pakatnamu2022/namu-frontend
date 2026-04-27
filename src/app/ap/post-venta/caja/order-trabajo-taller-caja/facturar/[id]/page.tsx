"use client";

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkOrderProvider } from "@/features/ap/post-venta/taller/orden-trabajo/contexts/WorkOrderContext";
import WorkOrderBillingForm from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderBillingForm";
import { WORKER_ORDER_CAJA } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import { useQuery } from "@tanstack/react-query";
import { findWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";

export default function BillWorkOrderCajaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrderId = id ? parseInt(id) : 0;
  const { ABSOLUTE_ROUTE } = WORKER_ORDER_CAJA;

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
    enabled: !!workOrderId,
  });

  if (isLoading) return <PageSkeleton />;

  if (!workOrder) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">Orden de trabajo no encontrada</h1>
        <Button onClick={() => navigate(ABSOLUTE_ROUTE)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <WorkOrderProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(ABSOLUTE_ROUTE)}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <TitleComponent
            title="Facturar Orden de Trabajo"
            subtitle={`${workOrder.correlative} - Placa: ${workOrder.vehicle_plate}`}
          />
        </div>

        <WorkOrderBillingForm workOrderId={workOrderId} />
      </div>
    </WorkOrderProvider>
  );
}
