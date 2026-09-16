"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CONTRACT_TYPE } from "../lib/contractType.constant.ts";

export default function ContractTypeActions() {
  const { ROUTE_ADD } = CONTRACT_TYPE;
  const push = useNavigate();

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => push(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Nuevo Tipo de Contrato
      </Button>
    </ActionsWrapper>
  );
}
