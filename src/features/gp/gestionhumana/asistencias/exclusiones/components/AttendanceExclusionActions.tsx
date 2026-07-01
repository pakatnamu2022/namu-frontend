"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AttendanceExclusionModal from "./AttendanceExclusionModal";
import { ATTENDANCE_EXCLUSION } from "../lib/attendance-exclusion.constants";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

const { MODEL } = ATTENDANCE_EXCLUSION;

export default function AttendanceExclusionActions() {
  const [open, setOpen] = useState(false);

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
      <AttendanceExclusionModal
        title={`Crear ${MODEL.name}`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
