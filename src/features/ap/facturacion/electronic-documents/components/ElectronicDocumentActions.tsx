"use client";

import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { ROUTE } = ELECTRONIC_DOCUMENT;

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={onRefresh}>
        <RefreshCw
          className={cn("size-4 mr-2", { "animate-spin": isLoading })}
        />
        Actualizar
      </Button>

      {permissions.canCreate && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`${ROUTE}/agregar`)}
        >
          <Plus className="size-4 mr-2" />
          Nuevo Documento
        </Button>
      )}
    </ActionsWrapper>
  );
}
