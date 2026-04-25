"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WORKER_ORDER_CAJA } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import { WorkOrderProvider } from "@/features/ap/post-venta/taller/orden-trabajo/contexts/WorkOrderContext";
import DirectBillingTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/DirectBillingTab";
import TitleComponent from "@/shared/components/TitleComponent";

export default function DirectInvoicePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { ABSOLUTE_ROUTE } = WORKER_ORDER_CAJA;

  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map(Number)
    .filter(Boolean);

  if (ids.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No se especificaron órdenes de trabajo</p>
      </div>
    );
  }

  return (
    <WorkOrderProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(ABSOLUTE_ROUTE)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <TitleComponent
            title="Generar Factura por Ordenes de Trabajo"
            subtitle={`Venta interna — ${ids.length} ${ids.length === 1 ? "orden de trabajo" : "órdenes de trabajo"} seleccionada(s)`}
          />
        </div>

        {/* Una única factura para todas las OTs */}
        <DirectBillingTab workOrderIds={ids} />
      </div>
    </WorkOrderProvider>
  );
}
