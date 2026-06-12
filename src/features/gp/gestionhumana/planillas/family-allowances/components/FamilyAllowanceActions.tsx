"use client";

import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FAMILY_ALLOWANCE } from "../lib/family-allowance.constant";

const { MODEL, ROUTE_ADD } = FAMILY_ALLOWANCE;

interface FamilyAllowanceActionsProps {
  companyId?: string;
  year?: string;
}

export default function FamilyAllowanceActions({ companyId, year }: FamilyAllowanceActionsProps) {
  const push = useNavigate();

  const handleNavigate = () => {
    const params = new URLSearchParams();
    if (companyId) params.set("companyId", companyId);
    if (year) params.set("year", year);
    const query = params.toString();
    push(query ? `${ROUTE_ADD}?${query}` : ROUTE_ADD);
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={handleNavigate}
      >
        <Users className="size-4 mr-2" /> {MODEL.name}
      </Button>
    </div>
  );
}
