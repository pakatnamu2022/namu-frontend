"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { ELECTRONIC_DOCUMENT } from "../lib/electronicDocument.constants";
import { cn } from "@/lib/utils";

interface ElectronicDocumentActionsProps {
  onRefresh: () => void;
  isLoading: boolean;
  permissions: {
    canCreate: boolean;
  };
}

export default function ElectronicDocumentActions({
  onRefresh,
  isLoading,
  permissions,
}: ElectronicDocumentActionsProps) {
  const router = useNavigate();
  const { ROUTE_ADD } = ELECTRONIC_DOCUMENT;

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw
          className={cn("size-4 mr-2", { "animate-spin": isLoading })}
        />
        Actualizar
      </Button>

      {permissions.canCreate && (
        <Button size="sm" variant="outline" onClick={() => router(ROUTE_ADD!)}>
          <Plus className="size-4 mr-2" />
          Nuevo Documento
        </Button>
      )}
    </ActionsWrapper>
  );
}
