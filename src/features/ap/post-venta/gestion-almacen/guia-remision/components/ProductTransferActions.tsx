"use client";

import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import { useNavigate } from "react-router-dom";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.constants.ts";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function ProductTransferActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = PRODUCT_TRANSFER;

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
        <Plus className="size-4 mr-2" /> Agregar Transferencia
      </Button>
    </ActionsWrapper>
  );
}
