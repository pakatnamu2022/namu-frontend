"use client";

import { Button } from "@/components/ui/button";
import { BookText } from "lucide-react";
import { useRouter } from "next/navigation";
import { ASSIGN_BRAND_CONSULTANT } from "../lib/assignBrandConsultant.constants";

interface AssignSedeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function AssignSedeActions({
  permissions,
}: AssignSedeActionsProps) {
  const router = useRouter();
  const { ROUTE } = ASSIGN_BRAND_CONSULTANT;

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => router.push(`${ROUTE}/gestionar`)}
      >
        <BookText className="size-4 mr-2" /> Gestionar Asignación
      </Button>
    </div>
  );
}
