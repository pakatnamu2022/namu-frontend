"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
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
  const router = useRouter();

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Marca
      </Button>
    </ActionsWrapper>
  );
}
