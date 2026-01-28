"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function UserActions() {
  const push = useNavigate();

  const handleAddUser = () => {
    push("./usuarios/actualizar");
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
