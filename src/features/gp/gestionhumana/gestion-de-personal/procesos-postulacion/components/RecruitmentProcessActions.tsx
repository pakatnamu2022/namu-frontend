"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RECRUITMENT_PROCESS } from "../lib/recruitmentProcess.constant.ts";

export default function RecruitmentProcessActions() {
  const { ROUTE_ADD } = RECRUITMENT_PROCESS;
  const push = useNavigate();

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Nuevo Proceso
      </Button>
    </ActionsWrapper>
  );
}
