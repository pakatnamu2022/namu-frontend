import { DataTable } from "@/shared/components/DataTable.tsx";
import { ProductCategoryResource } from "@/features/ap/post-venta/gestion-almacen/categorias-producto/lib/productCategory.interface.ts";
import { ProductCategoryColumns } from "./ProductCategoryColumns.tsx";

interface Props {
  columns: ProductCategoryColumns[];
  data: ProductCategoryResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductCategoryTable({
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
          name: true,
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
