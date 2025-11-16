"use client";

import { Button } from "@/components/ui/button";
import ActionsWrapper from "@/src/shared/components/ActionsWrapper";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ViewActions() {
  const { push } = useRouter();

  const handleAddView = () => {
    push("./vistas/agregar");
  };

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={handleAddView}
      >
        <Plus className="size-4 mr-2" /> Agregar Vista
      </Button>
    </ActionsWrapper>
  );
}
