"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WORKING_CONDITION } from "../lib/working-condition.constant";
import WorkingConditionAddModal from "./WorkingConditionAddModal";
import { useState } from "react";

const { MODEL } = WORKING_CONDITION;

interface WorkingConditionActionsProps {
  companyId: string;
  companyName?: string;
}

export default function WorkingConditionActions({
  companyId,
  companyName,
}: WorkingConditionActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Importar {MODEL.name}
      </Button>

      <WorkingConditionAddModal
        open={open}
        onClose={() => setOpen(false)}
        companyId={companyId}
        companyName={companyName}
      />
    </div>
  );
}
