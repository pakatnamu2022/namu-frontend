"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { VEHICLES_PV } from "../lib/vehicles.constants";

export default function VehicleActionsPV() {
  const router = useNavigate();

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(VEHICLES_PV.ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar Vehículo
      </Button>
    </ActionsWrapper>
  );
}
