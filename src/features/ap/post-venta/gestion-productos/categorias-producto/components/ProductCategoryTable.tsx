import { DataTable } from "@/src/shared/components/DataTable";
import { ProductCategoryResource } from "../lib/productCategory.interface";
import { ProductCategoryColumns } from "./ProductCategoryColumns";

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
