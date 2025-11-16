import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import ShopModal from "./ShopModal";

interface ShopActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ShopActions({ permissions }: ShopActionsProps) {
  const [open, setOpen] = useState(false);

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar Tienda
      </Button>
      <ShopModal
        title="Crear Tienda"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
