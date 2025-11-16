"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VehiclePurchaseOrderResource } from "../lib/vehiclePurchaseOrder.interface";
import VehiclePurchaseOrderDetailView from "./VehiclePurchaseOrderDetailView";

interface VehiclePurchaseOrderDetailButtonProps {
  purchaseOrder: VehiclePurchaseOrderResource;
}

export default function VehiclePurchaseOrderDetailButton({
  purchaseOrder,
}: VehiclePurchaseOrderDetailButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

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

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-3xl lg:max-w-5xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Detalle de Orden de Compra - {purchaseOrder.number}
            </SheetTitle>
            <SheetDescription>
              Información completa de la orden de compra incluyendo datos del
              vehículo, factura, items y resumen financiero.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <VehiclePurchaseOrderDetailView purchaseOrder={purchaseOrder} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
