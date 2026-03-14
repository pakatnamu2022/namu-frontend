"use client";

import { Button } from "@/components/ui/button";
import { Files, RefreshCw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { cn } from "@/lib/utils";

interface SalesReceiptsActionsProps {
  onOtherSalesClick?: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function SalesReceiptsActions({
  onOtherSalesClick,
  onRefresh,
  isLoading,
}: SalesReceiptsActionsProps) {
  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw
          className={cn("size-4 mr-2", { "animate-spin": isLoading })}
        />
        Actualizar
      </Button>
      <Button size="sm" variant="default" onClick={onOtherSalesClick}>
        <Files className="size-4 mr-2" />
        Otras Ventas
      </Button>
    </ActionsWrapper>
  );
}
