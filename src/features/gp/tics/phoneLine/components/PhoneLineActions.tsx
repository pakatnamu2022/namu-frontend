"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { FileUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PHONE_LINE } from "../lib/phoneLine.constants";

interface Props {
  onImport?: () => void;
}

export default function PhoneLineActions({ onImport }: Props) {
  const push = useNavigate();
  const { ROUTE_ADD } = PHONE_LINE;

  return (
    <ActionsWrapper>
      {onImport && (
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={onImport}
        >
          <FileUp className="size-4 mr-2" /> Importar
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className={onImport ? "" : "ml-auto"}
        onClick={() => push(ROUTE_ADD)}
      >
        <Plus className="size-4 mr-2" /> Agregar línea
      </Button>
    </ActionsWrapper>
  );
}
