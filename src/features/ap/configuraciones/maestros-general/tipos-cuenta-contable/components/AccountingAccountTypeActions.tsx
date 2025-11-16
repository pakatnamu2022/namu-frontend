"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper";
import { useState } from "react";
import AccountingAccountTypeModal from "./AccountingAccountTypeModal";

interface AccountingAccountTypeActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function AccountingAccountTypeActions({
  permissions,
}: AccountingAccountTypeActionsProps) {
  const [open, setOpen] = useState(false);

  if (!permissions.canCreate) {
    return null;
  }

  return (
    <ActionsWrapper>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-4 mr-2" /> Agregar Tipo de Cuenta Contable
      </Button>
      <AccountingAccountTypeModal
        title="Crear Tipo de Cuenta Contable"
        open={open}
        onClose={() => setOpen(false)}
        mode="create"
      />
    </ActionsWrapper>
  );
}
