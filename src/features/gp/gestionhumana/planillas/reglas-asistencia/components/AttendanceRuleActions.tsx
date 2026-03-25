"use client";

import { Button } from "@/components/ui/button";
import { Lock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ATTENDANCE_RULE } from "../lib/attendance-rule.constant";

const { MODEL, ROUTE_ADD } = ATTENDANCE_RULE;

interface AttendanceRuleActionsProps {
  onOpenRestrictions: () => void;
}

export default function AttendanceRuleActions({
  onOpenRestrictions,
}: AttendanceRuleActionsProps) {
  const push = useNavigate();

  return (
    <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={onOpenRestrictions}
      >
        <Lock className="size-4 mr-2" />
        Restricciones por persona
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar {MODEL.name}
      </Button>
    </div>
  );
}
