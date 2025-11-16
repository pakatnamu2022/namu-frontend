import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CurrencyTypesModal from "./CurrencyTypesModal";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

interface CurrencyTypesActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function CurrencyTypesActions({
  permissions,
}: CurrencyTypesActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Moneda
      </Button>
      <CurrencyTypesModal
        title="Crear Tipo de Moneda"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
