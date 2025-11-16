import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import DocumentTypeModal from "./DocumentTypesModal";

interface DocumentTypeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function DocumentTypeActions({
  permissions,
}: DocumentTypeActionsProps) {
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
        <Plus className="size-4 mr-2" /> Agregar Tipo de Documento
      </Button>
      <DocumentTypeModal
        title="Crear Tipo de Documento"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
