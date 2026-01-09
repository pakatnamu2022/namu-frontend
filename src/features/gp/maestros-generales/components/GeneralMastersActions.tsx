import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import GeneralMastersModal from "./GeneralMastersModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { GENERAL_MASTERS } from "../lib/generalMasters.constants";

interface GeneralMastersActionsProps {
  permissions: any;
}

export default function GeneralMastersActions({}: GeneralMastersActionsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const { ROUTE } = GENERAL_MASTERS;
  const { canCreate } = useModulePermissions(ROUTE);

  if (!canCreate) return null;

  return (
    <>
      <Button onClick={() => setShowCreate(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Maestro
      </Button>

      {showCreate && (
        <GeneralMastersModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          mode="create"
        />
      )}
    </>
  );
}
