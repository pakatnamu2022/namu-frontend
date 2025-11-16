import { DataTable } from "@/src/shared/components/DataTable";
import { SupplierOrderTypeResource } from "../lib/supplierOrderType.interface";
import { SupplierOrderTypeColumns } from "./SupplierOrderTypeColumns";

interface Props {
  columns: SupplierOrderTypeColumns[];
  data: SupplierOrderTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function SupplierOrderTypeTable({
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
