"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { ButtonGroup } from "@/shared/components/ButtonGroup";
import { Laptop, Phone, Plus } from "lucide-react";
import { AssignmentType } from "../lib/assignments.interface";

interface Props {
  type: AssignmentType;
  onTypeChange: (type: AssignmentType) => void;
  onAdd: () => void;
}

const TYPE_OPTIONS = [
  {
    value: "equipment" as AssignmentType,
    label: "Equipos",
    icon: <Laptop className="size-4" />,
  },
  {
    value: "phoneLine" as AssignmentType,
    label: "Líneas telefónicas",
    icon: <Phone className="size-4" />,
  },
];

export default function AssignmentsActions({
  type,
  onTypeChange,
  onAdd,
}: Props) {
  return (
    <ActionsWrapper>
      <ButtonGroup
        options={TYPE_OPTIONS}
        value={type}
        onChange={onTypeChange}
      />
      <Button size="sm" onClick={onAdd}>
        <Plus className="size-4 mr-2" />
        {type === "equipment" ? "Asignar equipos" : "Asignar línea"}
      </Button>
    </ActionsWrapper>
  );
}
