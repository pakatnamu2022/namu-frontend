"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { PRODUCT_TRANSFER } from "../lib/productTransfer.constants";

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
