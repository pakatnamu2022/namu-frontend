import { DataTable } from "@/shared/components/DataTable.tsx";
import { SupplierOrderResource } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.interface.ts";
import { SupplierOrderColumns } from "./SupplierOrderColumns.tsx";

interface Props {
  columns: SupplierOrderColumns[];
  data: SupplierOrderResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function SupplierOrderTable({
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
          order_number: true,
          supplier_id: true,
          order_date: true,
          supply_type: true,
          warehouse_id: true,
          sede_id: true,
          is_take: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
