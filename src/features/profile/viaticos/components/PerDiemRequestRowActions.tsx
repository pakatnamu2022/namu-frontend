"use client";

import { Button } from "@/components/ui/button";
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
  const hotel = request.hotel_reservation?.hotel_name;

  const handleAddHotelReservation = () => {
    navigate(
      `/gp/gestion-humana/viaticos/solicitud-viaticos/${request.id}/reserva-hotel/agregar`
    );
  };

  const handleSeeReservation = () => {
    navigate(
      `/gp/gestion-humana/viaticos/solicitud-viaticos/${request.id}/reserva-hotel/detalle`
    );
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      <Button
        variant="outline"
        size="icon-xs"
        onClick={() => onViewDetail(request.id)}
        tooltip="Ver detalle"
      >
        <Eye className="size-4" />
      </Button>
      <Button
        variant={hasHotelReservation ? "default" : "outline"}
        size="icon-xs"
        onClick={
          isApproved
            ? hasHotelReservation
              ? handleSeeReservation
              : handleAddHotelReservation
            : undefined
        }
        tooltip={
          hasHotelReservation ? `Hotel: ${hotel}` : "Agregar reserva de hotel"
        }
        disabled={!isApproved}
      >
        <Hotel className="size-4" />
      </Button>
    </div>
  );
}
