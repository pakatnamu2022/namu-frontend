"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { BANK_AP } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.constants";

interface ApBankActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function ApBankActions({ permissions }: ApBankActionsProps) {
  const router = useNavigate();
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
        onClick={() => router(ROUTE_ADD!)}
      >
        <Plus className="size-4 mr-2" /> Agregar Chequera
      </Button>
    </ActionsWrapper>
  );
}
