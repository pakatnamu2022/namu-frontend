"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { INSURANCE } from "../lib/insurance.constant";

const { MODEL, ROUTE_ADD } = INSURANCE;

interface InsuranceActionsProps {
  companyId?: string;
  companyName?: string;
}

export default function InsuranceActions({ companyId, companyName }: InsuranceActionsProps) {
  const push = useNavigate();

  const handleAdd = () => {
    const params = new URLSearchParams();
    if (companyId) params.set("companyId", companyId);
    if (companyName) params.set("companyName", companyName);
    push(`${ROUTE_ADD}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={handleAdd}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
