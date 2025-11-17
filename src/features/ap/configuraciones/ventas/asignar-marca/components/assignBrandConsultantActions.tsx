"use client";

import { Button } from "@/components/ui/button";
import { BookText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ASSIGN_BRAND_CONSULTANT } from "../lib/assignBrandConsultant.constants";

interface AssignSedeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function AssignSedeActions({
  permissions,
}: AssignSedeActionsProps) {
  const router = useNavigate();
  const { ABSOLUTE_ROUTE } = ASSIGN_BRAND_CONSULTANT;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router(`${ABSOLUTE_ROUTE}/gestionar`)}
      >
        <BookText className="size-4 mr-2" /> Gestionar Asignación
      </Button>
    </div>
  );
}
