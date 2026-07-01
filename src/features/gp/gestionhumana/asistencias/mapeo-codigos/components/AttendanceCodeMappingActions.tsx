"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AttendanceCodeMappingModal from "./AttendanceCodeMappingModal";
import { ATTENDANCE_CODE_MAPPING } from "../lib/attendance-code-mapping.constants";
import ActionsWrapper from "@/shared/components/ActionsWrapper";

const { MODEL } = ATTENDANCE_CODE_MAPPING;

export default function AttendanceCodeMappingActions() {
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
      <AttendanceCodeMappingModal
        title={`Crear ${MODEL.name}`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </ActionsWrapper>
  );
}
