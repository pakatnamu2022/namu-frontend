import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { PURCHASE_REQUEST_QUOTE } from "../lib/purchaseRequestQuote.constants";

interface PurchaseRequestQuoteActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function PurchaseRequestQuoteActions({
  permissions,
}: PurchaseRequestQuoteActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = PURCHASE_REQUEST_QUOTE;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Solicitud / Cotización
      </Button>
    </ActionsWrapper>
  );
}
