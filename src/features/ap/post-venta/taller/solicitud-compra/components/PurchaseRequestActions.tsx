import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PURCHASE_REQUEST } from "../lib/purchaseRequest.constants";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface PurchaseRequestActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function PurchaseRequestActions({
  permissions,
}: PurchaseRequestActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = PURCHASE_REQUEST;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar Solicitud
      </Button>
    </ActionsWrapper>
  );
}
