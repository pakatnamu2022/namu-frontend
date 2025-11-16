"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserActions() {
  const { push } = useRouter();

  const handleAddUser = () => {
    push("./usuarios/agregar");
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddUser}
      >
        <Plus className="size-4 mr-2" /> Agregar Usuario
      </Button>
    </ActionsWrapper>
  );
}
