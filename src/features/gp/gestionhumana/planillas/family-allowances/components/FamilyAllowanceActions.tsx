"use client";

import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FAMILY_ALLOWANCE } from "../lib/family-allowance.constant";

const { MODEL, ROUTE_ADD } = FAMILY_ALLOWANCE;

export default function FamilyAllowanceActions() {
  const push = useNavigate();

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <Users className="size-4 mr-2" /> Asignar {MODEL.name}
      </Button>
    </div>
  );
}
