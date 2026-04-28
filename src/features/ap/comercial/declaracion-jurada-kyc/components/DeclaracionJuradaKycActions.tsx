"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DECLARACION_JURADA_KYC } from "../lib/declaracionJuradaKyc.constants";

interface Props {
  permissions: {
    canCreate: boolean;
  };
}

export default function DeclaracionJuradaKycActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD } = DECLARACION_JURADA_KYC;

  return (
    <div className="flex items-center gap-2">
      {permissions.canCreate && (
        <Button
          size="sm"
          onClick={() => router(ROUTE_ADD)}
          className="gap-1"
        >
          <Plus className="size-4" />
          Nueva Declaración
        </Button>
      )}
    </div>
  );
}
