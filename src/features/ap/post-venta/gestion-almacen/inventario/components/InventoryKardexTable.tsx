import { DataTable } from "@/shared/components/DataTable.tsx";
import { InventoryMovementColumns } from "./InventoryMovementsColumns.tsx";
import { InventoryMovementResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovements.interface.ts";

interface Props {
  columns: InventoryMovementColumns[];
  data: InventoryMovementResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function InventoryKardexTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          movement_date: true,
          Fecha: true,
          movement_type: true,
          movement_number: true,
          document_number: true,
          warehouse_origin: true,
          warehouse_destination: true,
          user_name: true,
          notes: false,
          total_items: true,
          total_quantity: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
