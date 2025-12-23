"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Hotel } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";

interface PerDiemRequestRowActionsProps {
  request: PerDiemRequestResource;
  onViewDetail: (id: number) => void;
}

export function PerDiemRequestRowActions({
  request,
  onViewDetail,
}: PerDiemRequestRowActionsProps) {
  const navigate = useNavigate();
  const hasHotelReservation = !!request.hotel_reservation;
  const isApproved =
    request.status === "approved" || request.status === "in_progress";

  const handleAddHotelReservation = () => {
    navigate(`/gp/gestion-humana/viaticos/solicitud-viaticos/${request.id}/reserva-hotel/agregar`);
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        onClick={() => onViewDetail(request.id)}
        tooltip="Ver detalle"
      >
        <Eye className="size-4" />
      </Button>
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
