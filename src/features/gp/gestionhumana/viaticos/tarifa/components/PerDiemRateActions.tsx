"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { PER_DIEM_RATE } from "../lib/perDiemRate.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function PerDiemRateActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = PER_DIEM_RATE;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={() => router(ROUTE_ADD!)}>
        <Plus className="size-4 mr-2" /> Agregar Tarifa
      </Button>
    </ActionsWrapper>
  );
}
