import { DataTable } from "@/shared/components/DataTable";
import { ParentWarehouseColumns } from "./ParentWarehouseColumns";
import { ParentWarehouseResource } from "../lib/parentWarehouse.interface";

interface Props {
  columns: ParentWarehouseColumns[];
  data: ParentWarehouseResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ParentWarehouseTable({
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
          dyn_code: true,
          article_class: true,
          sede: true,
          type_operation: false,
          is_received: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
