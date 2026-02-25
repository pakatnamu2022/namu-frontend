import { ShipmentsReceptionsResource } from "../lib/shipmentsReceptions.interface";
import {
  useShipmentsReceptionsById,
  useReceptionChecklistById,
} from "../lib/shipmentsReceptions.hook";
import { SheetShipmentDetailsDialog as SharedDialog } from "@/features/ap/comercial/shared/components/SheetShipmentDetailsDialog";

interface ShipmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: ShipmentsReceptionsResource | null;
}

export function SheetShipmentDetailsDialog({
  open,
  onOpenChange,
  shipment: initialShipment,
}: ShipmentDetailsDialogProps) {
  const shipmentId = initialShipment?.id || 0;

  const { data: shipment, isLoading: isLoadingShipment } =
    useShipmentsReceptionsById(shipmentId);
  const { data: receptionData, isLoading: isLoadingChecklist } =
    useReceptionChecklistById(shipmentId);

  return (
    <SharedDialog
      open={open}
      onOpenChange={onOpenChange}
      documentNumber={initialShipment?.document_number ?? null}
      shipment={shipment}
      receptionData={receptionData}
      isLoading={isLoadingShipment || isLoadingChecklist}
    />
  );
}
