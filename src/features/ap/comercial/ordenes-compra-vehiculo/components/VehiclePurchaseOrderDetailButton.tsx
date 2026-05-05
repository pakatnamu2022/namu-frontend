"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehiclePurchaseOrderResource } from "../lib/vehiclePurchaseOrder.interface";
import VehiclePurchaseOrderDetailView from "./VehiclePurchaseOrderDetailView";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useVehiclePurchaseOrderById } from "../lib/vehiclePurchaseOrder.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface VehiclePurchaseOrderDetailButtonProps {
  purchaseOrder: VehiclePurchaseOrderResource;
}

export default function VehiclePurchaseOrderDetailButton({
  purchaseOrder,
}: VehiclePurchaseOrderDetailButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useVehiclePurchaseOrderById(
    purchaseOrder.id,
    isOpen,
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Ver Detalle"
        onClick={() => setIsOpen(true)}
      >
        <Eye className="size-4" />
      </Button>

      <GeneralSheet
        open={isOpen}
        onClose={() => setIsOpen(false)}
        icon="FileBarChart"
        title={`Detalle de Orden de Compra - ${purchaseOrder.number}`}
        subtitle="Información completa de la orden de compra incluyendo datos del vehículo, factura, items y resumen financiero."
        size="5xl"
      >
        {isLoading || !data ? (
          <FormSkeleton />
        ) : (
          <VehiclePurchaseOrderDetailView purchaseOrder={data} />
        )}
      </GeneralSheet>
    </>
  );
}
