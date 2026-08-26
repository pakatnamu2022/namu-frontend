"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Gauge } from "lucide-react";
import { TECHNICIAN_PRODUCTIVITY } from "@/features/ap/post-venta/taller/trabajos-asignados/lib/technicianProductivity.constants";

interface AssignedWorkActionsProps {
  workerId?: string;
  sedeId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export default function AssignedWorkActions({
  workerId,
  sedeId,
  dateFrom,
  dateTo,
}: AssignedWorkActionsProps) {
  const router = useNavigate();

  const handleViewProductivity = () => {
    const params = new URLSearchParams();
    if (workerId) params.set("worker_id", workerId);
    if (sedeId) params.set("sede_id", sedeId);
    if (dateFrom) params.set("date_from", dateFrom.toLocaleDateString("en-CA"));
    if (dateTo) params.set("date_to", dateTo.toLocaleDateString("en-CA"));

    const query = params.toString();
    router(
      `${TECHNICIAN_PRODUCTIVITY.ABSOLUTE_ROUTE}${query ? `?${query}` : ""}`,
    );
  };

  return (
    <ActionsWrapper>
      <Button size="sm" variant="outline" onClick={handleViewProductivity}>
        <Gauge className="size-4 mr-2" /> Ver Productividad
      </Button>
    </ActionsWrapper>
  );
}
