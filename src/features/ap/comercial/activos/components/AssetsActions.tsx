"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ASSETS } from "../lib/assets.constants";

interface Props {
  permissions: { canCreate: boolean };
  isFetching?: boolean;
  onRefresh: () => void;
}

export default function AssetsActions({
  permissions,
  isFetching,
  onRefresh,
}: Props) {
  const router = useNavigate();

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCcw className={cn("size-4 mr-2", { "animate-spin": isFetching })} />
        Actualizar
      </Button>
      {permissions.canCreate && (
        <Button size="sm" onClick={() => router(ASSETS.ROUTE_ADD!)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Activo
        </Button>
      )}
    </ActionsWrapper>
  );
}
