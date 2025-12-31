import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CommercialMastersModal from "./CommercialMastersModal";

interface CommercialMastersActionsProps {
  permissions: any;
}

export default function CommercialMastersActions({
  permissions,
}: CommercialMastersActionsProps) {
  const [showCreate, setShowCreate] = useState(false);

  if (!permissions.canCreate) return null;

  return (
    <>
      <Button onClick={() => setShowCreate(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Maestro
      </Button>

      {showCreate && (
        <CommercialMastersModal
          title="Crear Maestro Comercial"
          open={showCreate}
          onClose={() => setShowCreate(false)}
          mode="create"
        />
      )}
    </>
  );
}
