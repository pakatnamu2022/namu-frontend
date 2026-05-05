"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { SHIPMENTS_RECEPTIONS } from "../lib/shipmentsReceptions.constants";
import { cn } from "@/lib/utils";

interface Props {
  permissions: {
    canCreate: boolean;
  };
  isFetching?: boolean;
  onRefresh: () => void;
  // send_dynamics?: boolean;
}

export default function ShipmentsReceptionsActions({
  permissions,
  onRefresh,
  isFetching,
  // send_dynamics,
}: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = SHIPMENTS_RECEPTIONS;

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
        <Plus className="mr-2 h-4 w-4" />
        Nueva Guía de Remisión
      </Button>
    </ActionsWrapper>
  );
}
