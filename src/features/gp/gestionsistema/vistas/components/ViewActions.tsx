"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VIEW } from "../lib/view.constants";

export default function ViewActions() {
  const push = useNavigate();
  const { ROUTE_ADD } = VIEW;

  const handleAddView = () => {
    push(ROUTE_ADD!);
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddView}
      >
        <Plus className="size-4 mr-2" /> Agregar Vista
      </Button>
    </ActionsWrapper>
  );
}
