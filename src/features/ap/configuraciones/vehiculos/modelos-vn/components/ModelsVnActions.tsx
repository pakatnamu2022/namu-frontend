"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { MODELS_VN } from "../lib/modelsVn.constanst";

interface ModelsVnActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ModelsVnActions({ permissions }: ModelsVnActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = MODELS_VN;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Modelo VN
      </Button>
    </ActionsWrapper>
  );
}
