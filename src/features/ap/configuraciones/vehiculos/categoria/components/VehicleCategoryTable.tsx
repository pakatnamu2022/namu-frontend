import { DataTable } from "@/src/shared/components/DataTable";
import { VehicleCategoryResource } from "../lib/vehicleCategory.interface";
import { VehicleCategoryColumns } from "./VehicleCategoryColumns";

interface Props {
  columns: VehicleCategoryColumns[];
  data: VehicleCategoryResource[];
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
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
