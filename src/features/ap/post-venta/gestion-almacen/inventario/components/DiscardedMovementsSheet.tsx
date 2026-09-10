import type { ColumnDef } from "@tanstack/react-table";
import GeneralSheet from "@/shared/components/GeneralSheet.tsx";
import { DataTable } from "@/shared/components/DataTable.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog.tsx";
import { RotateCcw } from "lucide-react";
import { formatDate } from "@/core/core.function.ts";
import { translateMovementType } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.constants.ts";
import {
  useIgnoredInventoryMovements,
  useRestoreInventoryMovement,
} from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import { InventoryMovementIgnoredRow } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovementsList.interface.ts";

interface DiscardedMovementsSheetProps {
  open: boolean;
  onClose: () => void;
  productId: number;
  warehouseId: number;
}

export default function DiscardedMovementsSheet({
  open,
  onClose,
  productId,
  warehouseId,
}: DiscardedMovementsSheetProps) {
  const { data, isLoading } = useIgnoredInventoryMovements(
    { product_id: productId, warehouse_id: warehouseId, per_page: 100 },
    { enabled: open && !isNaN(productId) && !isNaN(warehouseId) },
  );

  const { mutate: restore, isPending } = useRestoreInventoryMovement();

  const columns: ColumnDef<InventoryMovementIgnoredRow>[] = [
    {
      accessorKey: "movement_date",
      header: "Fecha",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value ? formatDate(value) : "-";
      },
    },
    {
      accessorKey: "movement_type",
      header: "Tipo",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="whitespace-nowrap">
          {translateMovementType(getValue() as string)}
        </Badge>
      ),
    },
    {
      accessorKey: "movement_number",
      header: "N° Movimiento",
      cell: ({ getValue }) => (getValue() as string) || "-",
    },
    {
      accessorKey: "quantity_in",
      header: "Cant. Ingresada",
    },
    {
      accessorKey: "quantity_out",
      header: "Cant. Salida",
    },
    {
      accessorKey: "discarded_reason",
      header: "Motivo",
      cell: ({ getValue }) => {
        const value = getValue() as string | null;
        if (!value) return "-";
        return (
          <span className="text-sm text-muted-foreground truncate max-w-xs block">
            {value}
          </span>
        );
      },
    },
    {
      id: "discarded_meta",
      header: "Descartado por",
      cell: ({ row }) => {
        const { discarded_by_name, discarded_at } = row.original;
        return (
          <div className="flex flex-col text-sm">
            <span>{discarded_by_name || "-"}</span>
            {discarded_at && (
              <span className="text-xs text-muted-foreground">
                {formatDate(discarded_at)}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <ConfirmationDialog
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              disabled={isPending}
              tooltip="Revertir movimiento"
            >
              <RotateCcw className="h-4 w-4" />
              Revertir
            </Button>
          }
          title="Revertir movimiento"
          description="El movimiento volverá a contar en el kardex del producto. ¿Deseas continuar?"
          confirmText="Sí, revertir"
          cancelText="Cancelar"
          icon="warning"
          onConfirm={() => restore(row.original.id)}
        />
      ),
    },
  ];

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Movimientos descartados"
      subtitle="Movimientos ignorados en el kardex de este producto"
      icon="Archive"
      size="5xl"
    >
      <div className="text-muted-foreground max-w-full">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
        />
      </div>
    </GeneralSheet>
  );
}
