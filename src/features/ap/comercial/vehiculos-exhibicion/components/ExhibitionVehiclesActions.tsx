"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useNavigate } from "react-router-dom";
import { EXHIBITION_VEHICLES } from "../lib/exhibitionVehicles.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function ExhibitionVehiclesActions({ permissions }: Props) {
  const navigate = useNavigate();
  const { ROUTE } = EXHIBITION_VEHICLES;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button size="sm" onClick={() => navigate(`${ROUTE}/agregar`)}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Vehículo de Exhibición
      </Button>
    </ActionsWrapper>
  );
}
