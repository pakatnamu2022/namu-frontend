import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import CommercialMastersModal from "./CommercialMastersModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { COMMERCIAL_MASTERS } from "../lib/commercialMasters.constants";

interface CommercialMastersActionsProps {
  permissions: any;
}

export default function CommercialMastersActions({}: CommercialMastersActionsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const { ROUTE } = COMMERCIAL_MASTERS;
  const { canCreate } = useModulePermissions(ROUTE);

  if (!canCreate) return null;

  return (
    <>
      <Button onClick={() => setShowCreate(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Maestro
      </Button>

      {showCreate && (
        <CommercialMastersModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          mode="create"
        />
      )}
    </>
  );
}
