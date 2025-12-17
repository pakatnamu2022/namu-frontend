"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";
import { useNavigate } from "react-router-dom";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function PerDiemRequestActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = PER_DIEM_REQUEST;

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
        <Plus className="size-4 mr-2" /> Agregar Solicitud
      </Button>
    </ActionsWrapper>
  );
}
