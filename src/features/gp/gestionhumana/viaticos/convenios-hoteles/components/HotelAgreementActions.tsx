"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { HOTEL_AGREEMENT } from "../lib/hotelAgreement.constants";
import { useNavigate } from "react-router-dom";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function HotelAgreementActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = HOTEL_AGREEMENT;

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
        <Plus className="size-4 mr-2" /> Agregar Convenio
      </Button>
    </ActionsWrapper>
  );
}
