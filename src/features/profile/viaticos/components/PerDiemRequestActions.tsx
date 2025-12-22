"use client";

import { Button } from "@/components/ui/button";
import { Plus, ClipboardCheck } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";
import { useNavigate } from "react-router-dom";

interface Props {
  permissions: {
    canCreate: boolean;
    canApprove?: boolean;
  };
}

export default function PerDiemRequestActions({ permissions }: Props) {
  const router = useNavigate();
  const { ROUTE_ADD, ABSOLUTE_ROUTE } = PER_DIEM_REQUEST;

  if (!permissions.canCreate && !permissions.canApprove) {
    return null;
  }

  return (
    <ActionsWrapper>
      {permissions.canApprove && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => router(`${ABSOLUTE_ROUTE}/aprobar`)}
        >
          <ClipboardCheck className="size-4 mr-2" /> Revisar Solicitudes
        </Button>
      )}
      {permissions.canCreate && (
        <Button
          size="sm"
          variant="outline"
          className={permissions.canApprove ? "" : "ml-auto"}
          onClick={() => router(ROUTE_ADD!)}
        >
          <Plus className="size-4 mr-2" /> Agregar Solicitud
        </Button>
      )}
    </ActionsWrapper>
  );
}
