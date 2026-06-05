"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { TRANSFERS } from "../lib/transfers.constants";
import { cn } from "@/lib/utils";

interface Props {
  permissions: { canCreate: boolean };
  isFetching?: boolean;
  onRefresh: () => void;
}

export default function TransfersActions({ permissions, isFetching, onRefresh }: Props) {
  const router = useNavigate();

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCcw className={cn("size-4 mr-2", { "animate-spin": isFetching })} />
        Actualizar
      </Button>
      {permissions.canCreate && (
        <Button size="sm" onClick={() => router(TRANSFERS.ROUTE_ADD!)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Traslado Interno
        </Button>
      )}
    </ActionsWrapper>
  );
}
