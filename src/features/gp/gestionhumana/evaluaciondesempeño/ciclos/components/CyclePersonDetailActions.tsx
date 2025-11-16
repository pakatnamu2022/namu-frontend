"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { Users } from "lucide-react";

interface Props {
  id: number;
  onAssign: (id: number) => void;
}

export default function CyclePersonDetailActions({ id, onAssign }: Props) {
  return (
    <ActionsWrapper>
      {/* Asign */}
      <Button variant="outline" size="sm" onClick={() => onAssign(id)}>
        <Users className="size-5" />
        Asignar
      </Button>
    </ActionsWrapper>
  );
}
