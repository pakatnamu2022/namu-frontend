"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hotel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";

interface PerDiemRequestRowActionsProps {
  request: PerDiemRequestResource;
}

export function PerDiemRequestRowActions({
  request,
}: PerDiemRequestRowActionsProps) {
  const navigate = useNavigate();
  const hasHotelReservation = !!request.hotel_reservation;
  const isApproved =
    request.status === "approved" || request.status === "in_progress";

  const handleAddHotelReservation = () => {
    navigate(`/perfil/viaticos/${request.id}/reserva-hotel/agregar`);
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      {!hasHotelReservation && isApproved && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddHotelReservation}
          tooltip="Agregar Reserva de Hotel"
        >
          <Hotel className="h-4 w-4" />
        </Button>
      )}
      {hasHotelReservation && (
        <Badge variant="green" className="text-xs">
          <Hotel className="h-3 w-3 mr-1" />
          Reserva creada
        </Badge>
      )}
    </div>
  );
}
