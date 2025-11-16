import { useNavigate } from 'react-router-dom';
import { COMMERCIAL_MANAGER_BRAND_GROUP } from "../lib/commercialManagerBrandGroup.constants";
import { Button } from "@/components/ui/button";
import { ClipboardMinus } from "lucide-react";

interface CommercialManagerBrandGroupActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function CommercialManagerBrandGroupActions({
  permissions,
}: CommercialManagerBrandGroupActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = COMMERCIAL_MANAGER_BRAND_GROUP;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD!)}
      >
        <ClipboardMinus className="size-4 mr-2" /> Agregar Grupo Marca
      </Button>
    </div>
  );
}
