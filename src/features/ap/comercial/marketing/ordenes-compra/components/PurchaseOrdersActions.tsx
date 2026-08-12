import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { MARKETING_PURCHASE_ORDERS } from "../lib/purchaseOrders.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function PurchaseOrdersActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = MARKETING_PURCHASE_ORDERS;

  if (!permissions.canCreate) return null;

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" className="ml-auto" onClick={() => router(ROUTE_ADD!)}>
        <Plus className="size-4 mr-2" /> Agregar Orden de Compra
      </Button>
    </ActionsWrapper>
  );
}
