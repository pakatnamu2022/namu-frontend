import { DataTable } from "@/shared/components/DataTable";
import { ProductResource } from "../lib/product.interface";
import { ProductColumns } from "./ProductColumns";

interface Props {
  columns: ProductColumns[];
  data: ProductResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductTable({
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
          name: true,
          brand_name: true,
          category_name: true,
          unit_measurement_name: true,
          total_stock: true,
          sale_price: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
