"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { MODELS_VN, MODELS_VN_POSTVENTA } from "../lib/modelsVn.constanst";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

interface ModelsVnActionsProps {
  isCommercial: number;
  permissions: {
    canCreate: boolean;
  };
}

export default function ModelsVnActions({
  permissions,
  isCommercial = CM_COMERCIAL_ID,
}: ModelsVnActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } =
    isCommercial === CM_COMERCIAL_ID ? MODELS_VN : MODELS_VN_POSTVENTA;

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
