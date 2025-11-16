"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from 'react-router-dom';
import { SUPPLIERS } from "../lib/suppliers.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function SuppliersActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = SUPPLIERS;

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
        <Plus className="size-4 mr-2" /> Agregar Proveedor
      </Button>
    </ActionsWrapper>
  );
}
