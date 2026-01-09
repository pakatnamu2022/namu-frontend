"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { cn } from "@/lib/utils";

interface SalesReceiptsActionsProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export default function SalesReceiptsActions({
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
    </ActionsWrapper>
  );
}
