"use client";

import { Button } from "@/components/ui/button.tsx";
import { FileBox, FileSpreadsheet, GitCompareArrows } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import DropdownButton from "@/shared/components/DropdownButton.tsx";
import { useNavigate } from "react-router-dom";
import { INVENTORY } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu.tsx";
import { useMutation } from "@tanstack/react-query";
import { exportInventory } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.actions.ts";
import { errorToast, successToast } from "@/core/core.function.ts";

interface Props {
  permissions: {
    canCreate: boolean;
  };
  warehouseId?: string;
}

export default function InventoryActions({ permissions, warehouseId }: Props) {
  const router = useNavigate();
  const { ABSOLUTE_ROUTE } = INVENTORY;

  const { mutate: doExport, isPending } = useMutation({
    mutationFn: exportInventory,
    onSuccess: () => successToast("Reporte descargado correctamente"),
    onError: () => errorToast("Error al generar el reporte"),
  });

  const handleExport = (stockType: "all" | "with_stock" | "without_stock") => {
    if (!warehouseId) return;
    doExport({ warehouse_id: Number(warehouseId), stock_type: stockType });
  };

  return (
    <ActionsWrapper>
      <DropdownButton
        label="Reportes"
        icon={FileSpreadsheet}
        isPending={isPending}
        disabled={!warehouseId}
        menuLabel="Stock de Inventario"
      >
        <DropdownMenuItem
          onClick={() => handleExport("all")}
          disabled={isPending}
        >
          <FileSpreadsheet className="size-4 mr-2" />
          Total
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("with_stock")}
          disabled={isPending}
        >
          <FileSpreadsheet className="size-4 mr-2" />
          Con stock
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("without_stock")}
          disabled={isPending}
        >
          <FileSpreadsheet className="size-4 mr-2" />
          Sin stock
        </DropdownMenuItem>
      </DropdownButton>

      <Button
        size="sm"
        variant="outline"
        disabled={!warehouseId}
        onClick={() =>
          router(`${ABSOLUTE_ROUTE}/comparativa-dynamics?warehouse_id=${warehouseId}`)
        }
      >
        <GitCompareArrows className="size-4 mr-2" /> Comparativa Dynamics
      </Button>

      {permissions.canCreate && (
        <Button
          size="sm"
          variant="default"
          onClick={() => router(`${ABSOLUTE_ROUTE}/kardex`)}
        >
          <FileBox className="size-4 mr-2" /> Movimiento de Inventario
        </Button>
      )}
    </ActionsWrapper>
  );
}
