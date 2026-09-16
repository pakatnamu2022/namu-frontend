"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CONTRACT_TEMPLATE } from "../lib/contractTemplate.constant.ts";

export default function ContractTemplateActions() {
  const { ROUTE_ADD } = CONTRACT_TEMPLATE;
  const push = useNavigate();

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Nueva Plantilla
      </Button>
    </ActionsWrapper>
  );
}
