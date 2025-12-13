"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { SHIPMENTS_RECEPTIONS } from "../lib/shipmentsReceptions.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function ShipmentsReceptionsActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = SHIPMENTS_RECEPTIONS;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button size="sm" onClick={() => router(ROUTE_ADD!)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Guía de Remisión
      </Button>
    </ActionsWrapper>
  );
}
