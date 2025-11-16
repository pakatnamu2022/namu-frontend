import { DataTable } from "@/shared/components/DataTable";
import { WarehouseColumns } from "./WarehouseColumns";
import { WarehouseResource } from "../lib/warehouse.interface";

interface Props {
  columns: WarehouseColumns[];
  data: WarehouseResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleCategoryTable({
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
          description: true,
          article_class: true,
          sede: true,
          type_operation: false,
          inventory_account: false,
          counterparty_account: false,
          is_received: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
