"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { BANK_AP } from "@/src/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";

interface ApBankActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ApBankActions({ permissions }: ApBankActionsProps) {
  const router = useRouter();
  const { ROUTE_ADD } = BANK_AP;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Chequera
      </Button>
    </ActionsWrapper>
  );
}
