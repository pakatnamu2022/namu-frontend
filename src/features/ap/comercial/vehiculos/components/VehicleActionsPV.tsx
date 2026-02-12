"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { VEHICLES_TLL, VEHICLES_RP } from "../lib/vehicles.constants";

interface Props {
  module: "TALLER" | "REPUESTOS";
}

export default function VehicleActionsPV({ module }: Props) {
  const router = useNavigate();
  const ROUTE_ADD =
    module === "TALLER" ? VEHICLES_TLL.ROUTE_ADD : VEHICLES_RP.ROUTE_ADD;

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar Vehículo
      </Button>
    </ActionsWrapper>
  );
}
