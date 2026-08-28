import { DataTable } from "@/shared/components/DataTable.tsx";
import { ProductShelfResource } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.interface.ts";
import { ProductShelfColumns } from "./ProductShelfColumns.tsx";

interface Props {
  columns: ProductShelfColumns[];
  data: ProductShelfResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductShelfTable({
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
          code: true,
          label: true,
          warehouse: true,
          notes: false,
          creator: false,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
