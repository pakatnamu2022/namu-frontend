"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ExpenseTypeModal from "./ExpenseTypeModal";

interface ExpenseTypeActionsProps {
  permissions: { canCreate: boolean };
}

export default function ExpenseTypeActions({ permissions }: ExpenseTypeActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {permissions.canCreate && (
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo de Gasto
        </Button>
      )}

      {isModalOpen && (
        <ExpenseTypeModal
          title="Crear Tipo de Gasto"
          open={true}
          onClose={() => setIsModalOpen(false)}
          mode="create"
        />
      )}
    </>
  );
}
