"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PAYROLL_PERIOD } from "../lib/payroll-period.constant";

const { MODEL } = PAYROLL_PERIOD;

interface Props {
  onAdd: () => void;
}

export default function PayrollPeriodActions({ onAdd }: Props) {
  return (
    <div className="flex items-center gap-2 w-full">
      <Button
        size="sm"
        variant="outline"
        className="md:ml-auto w-full md:w-auto"
        onClick={onAdd}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
