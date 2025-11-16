"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { BRAND, BRAND_POSTVENTA } from "../lib/brands.constants";

interface BrandActionsProps {
  isCommercial?: boolean;
  permissions: {
    canCreate: boolean;
  };
}

export default function BrandActions({
  permissions,
  isCommercial = true,
}: BrandActionsProps) {
  const { ROUTE_ADD } = isCommercial ? BRAND : BRAND_POSTVENTA;
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
