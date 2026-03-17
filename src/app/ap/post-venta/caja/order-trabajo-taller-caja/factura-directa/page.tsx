"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WORKER_ORDER_CAJA } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import { WorkOrderProvider } from "@/features/ap/post-venta/taller/orden-trabajo/contexts/WorkOrderContext";
import DirectBillingTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/DirectBillingTab";

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
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(ABSOLUTE_ROUTE)}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">
                Generar Factura Directa
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Venta interna —{" "}
                {ids.length === 1
                  ? "1 orden de trabajo seleccionada"
                  : `${ids.length} órdenes de trabajo seleccionadas`}
              </p>
            </div>
          </div>
        </Card>

        {/* Una única factura para todas las OTs */}
        <Card className="p-6">
          <DirectBillingTab workOrderIds={ids} />
        </Card>
      </div>
    </WorkOrderProvider>
  );
}
