import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import BodyTypeModal from "./BodyTypeModal";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";

interface BodyTypeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function BodyTypeActions({ permissions }: BodyTypeActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Carrocería
      </Button>
      <BodyTypeModal
        title="Crear Tipo de Carrocería"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
