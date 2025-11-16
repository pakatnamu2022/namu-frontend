"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from 'react-router-dom'
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { VEHICLE_DELIVERY } from "../lib/vehicleDelivery.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function VehicleDeliveryActions({ permissions }: Props) {
  const { ROUTE_ADD } = VEHICLE_DELIVERY;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Link to={`/ap/comercial/${ROUTE_ADD}`}>
        <Button size="sm" variant="outline" className="ml-auto">
          <Plus className="size-4 mr-2" /> Programar Entrega
        </Button>
      </Link>
    </ActionsWrapper>
  );
}
