import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import TypesCategoryModal from "./TypesCategoryModal";

interface TypesCategoryActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function TypesCategoryActions({
  permissions,
}: TypesCategoryActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Categoría
      </Button>
      <TypesCategoryModal
        title="Crear Tipo de Categoría"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
