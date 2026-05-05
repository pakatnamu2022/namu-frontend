"use client";

import { Button } from "@/components/ui/button.tsx";
import { FileBox, FileSpreadsheet, ChevronDown, Loader2 } from "lucide-react";
import ActionsWrapper from "@/shared/components/ActionsWrapper.tsx";
import { useNavigate } from "react-router-dom";
import { INVENTORY } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="size-4 mr-2" />
            )}
            Reportes
            <ChevronDown className="size-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52" align="end">
          <DropdownMenuLabel>Stock de Inventario</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleExport("all")}
            disabled={!warehouseId || isPending}
          >
            <FileSpreadsheet className="size-4 mr-2" />
            Total
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("with_stock")}
            disabled={!warehouseId || isPending}
          >
            <FileSpreadsheet className="size-4 mr-2" />
            Con stock
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport("without_stock")}
            disabled={!warehouseId || isPending}
          >
            <FileSpreadsheet className="size-4 mr-2" />
            Sin stock
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
