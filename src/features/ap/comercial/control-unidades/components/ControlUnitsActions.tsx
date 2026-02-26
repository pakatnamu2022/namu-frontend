"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { CONTROL_UNITS } from "../lib/controlUnits.constants";
import { cn } from "@/lib/utils";
import { TEXT_NEW } from "@/core/core.function";

interface Props {
  permissions: {
    canCreate: boolean;
  };
  isFetching?: boolean;
  onRefresh: () => void;
}

export default function ControlUnitsActions({
  permissions,
  onRefresh,
  isFetching,
}: Props) {
  const router = useNavigate();
  const { ROUTE_ADD, MODEL } = CONTROL_UNITS;

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
        {TEXT_NEW(MODEL)}
      </Button>
    </ActionsWrapper>
  );
}
