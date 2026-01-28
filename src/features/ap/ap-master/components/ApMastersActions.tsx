import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import ApMastersModal from "./ApMastersModal";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function ApMastersActions({ permissions }: Props) {
  const [showCreate, setShowCreate] = useState(false);

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setShowCreate(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Agregar Maestro
      </Button>

      {showCreate && (
        <ApMastersModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          mode="create"
        />
      )}
    </>
  );
}
