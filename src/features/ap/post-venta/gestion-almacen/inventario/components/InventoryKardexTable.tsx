import { DataTable } from "@/shared/components/DataTable.tsx";
import { InventoryKardexColumns } from "./InventoryKardexColumns.tsx";
import { InventoryKardexResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovements.interface.ts";

interface Props {
  columns: InventoryKardexColumns[];
  data: InventoryKardexResource[];
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
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
