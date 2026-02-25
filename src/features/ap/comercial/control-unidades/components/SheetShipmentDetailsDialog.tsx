import { ControlUnitsResource } from "../lib/controlUnits.interface";
import {
  useControlUnitsById,
  useReceptionChecklistById,
} from "../lib/controlUnits.hook";
import { SheetShipmentDetailsDialog as SharedDialog } from "@/features/ap/comercial/shared/components/SheetShipmentDetailsDialog";

interface ShipmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: ControlUnitsResource | null;
}

export function SheetShipmentDetailsDialog({
  open,
  onOpenChange,
  shipment: initialShipment,
}: ShipmentDetailsDialogProps) {
  const shipmentId = initialShipment?.id || 0;

  const { data: shipment, isLoading: isLoadingShipment } =
    useControlUnitsById(shipmentId);
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
