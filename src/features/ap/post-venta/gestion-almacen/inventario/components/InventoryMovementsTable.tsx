import { DataTable } from "@/shared/components/DataTable.tsx";
import { InventoryMovementColumns } from "./InventoryMovementsColumns.tsx";
import { InventoryMovementResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovements.interface.ts";

interface Props {
  columns: InventoryMovementColumns[];
  data: InventoryMovementResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function InventoryMovementsTable({
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
          warehouse_origin: false,
          warehouse_destination: false,
          user_name: false,
          notes: false,
          quantity_in: true,
          quantity_out: true,
          balance: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
