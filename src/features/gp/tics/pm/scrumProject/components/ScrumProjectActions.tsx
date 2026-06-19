"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SCRUM_PROJECT } from "../lib/scrumProject.constants";

export default function ScrumProjectActions() {
  const push = useNavigate();
  const { ROUTE_ADD } = SCRUM_PROJECT;

  return (
    <ActionsWrapper>
      <Button size="sm" className="ml-auto" onClick={() => push(ROUTE_ADD)}>
        <Plus className="size-4 mr-2" /> Nuevo proyecto
      </Button>
    </ActionsWrapper>
  );
}
