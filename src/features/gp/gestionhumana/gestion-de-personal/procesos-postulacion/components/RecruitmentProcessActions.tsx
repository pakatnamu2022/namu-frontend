"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { CalendarPlus, Mail, Plus, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RECRUITMENT_PROCESS } from "../lib/recruitmentProcess.constant.ts";

export default function RecruitmentProcessActions({
  onAddDays,
}: {
  onAddDays?: () => void;
}) {
  const { ROUTE_ADD, ABSOLUTE_ROUTE } = RECRUITMENT_PROCESS;
  const push = useNavigate();

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => push(`${ABSOLUTE_ROUTE}/mensajes-postulante`)}
      >
        <Mail className="size-4 mr-2" /> Mensajes por estado
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => push(`${ABSOLUTE_ROUTE}/mensajes-proceso`)}
      >
        <Send className="size-4 mr-2" /> Mensajes por etapa
      </Button>
      {onAddDays && (
        <Button size="sm" variant="outline" onClick={onAddDays}>
          <CalendarPlus className="size-4 mr-2" /> Agregar días
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={() => push(ROUTE_ADD)}>
        <Plus className="size-4 mr-2" /> Nuevo Proceso
      </Button>
    </ActionsWrapper>
  );
}
