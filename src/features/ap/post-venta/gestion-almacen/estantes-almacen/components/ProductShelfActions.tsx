"use client";

import { Button } from "@/components/ui/button.tsx";
import { Plus } from "lucide-react";
import { useState } from "react";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import ProductShelfModal from "./ProductShelfModal.tsx";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";

interface Props {
  permissions: {
    canManage: boolean;
  };
  warehouses: WarehouseResource[];
  defaultWarehouseId?: string;
}

export default function ProductShelfActions({
  permissions,
  warehouses,
  defaultWarehouseId,
}: Props) {
  const [open, setOpen] = useState(false);

  if (!permissions.canManage) {
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
        <Plus className="size-4 mr-2" /> Agregar Estante
      </Button>
      {open && (
        <ProductShelfModal
          title="Crear Estante"
          open={open}
          onClose={() => setOpen(false)}
          mode="create"
          warehouses={warehouses}
          defaultWarehouseId={defaultWarehouseId}
        />
      )}
    </ActionsWrapper>
  );
}
