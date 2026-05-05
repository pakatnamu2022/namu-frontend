"use client";

import { Button } from "@/components/ui/button.tsx";
import { Plus, RefreshCcw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import { useNavigate } from "react-router-dom";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-almacen/guia-remision/lib/productTransfer.constants.ts";
import { cn } from "@/lib/utils";

interface Props {
  permissions: {
    canCreate: boolean;
  };
  isFetching?: boolean;
  onRefresh: () => void;
}

export default function ProductTransferActions({
  permissions,
  onRefresh,
  isFetching,
}: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = PRODUCT_TRANSFER;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={() => onRefresh()}>
        <RefreshCcw
          className={cn("size-4 mr-2", { "animate-spin": isFetching })}
        />
        Actualizar
      </Button>
      <Button size="sm" onClick={() => router(ROUTE_ADD!)}>
        <Plus className="size-4 mr-2" /> Agregar guía
      </Button>
    </ActionsWrapper>
  );
}
