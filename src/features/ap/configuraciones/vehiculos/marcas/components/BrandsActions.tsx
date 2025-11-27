"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { BRAND, BRAND_POSTVENTA } from "../lib/brands.constants";
import { CM_COMERCIAL_ID } from "@/core/core.constants";

interface BrandActionsProps {
  isCommercial: number;
  permissions: {
    canCreate: boolean;
  };
}

export default function BrandActions({
  permissions,
  isCommercial = CM_COMERCIAL_ID,
}: BrandActionsProps) {
  const { ROUTE_ADD } =
    isCommercial === CM_COMERCIAL_ID ? BRAND : BRAND_POSTVENTA;
  const router = useNavigate();

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
        <Plus className="size-4 mr-2" /> Agregar Marca
      </Button>
    </ActionsWrapper>
  );
}
