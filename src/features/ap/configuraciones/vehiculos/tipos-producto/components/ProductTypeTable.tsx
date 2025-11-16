import { DataTable } from "@/shared/components/DataTable";
import { ProductTypeResource } from "../lib/productType.interface";
import { ProductTypeColumns } from "./ProductTypeColumns";

interface Props {
  columns: ProductTypeColumns[];
  data: ProductTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ProductTypeTable({
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
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
