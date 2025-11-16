import { DataTable } from "@/shared/components/DataTable";
import { VehicleStatusResource } from "../lib/vehicleStatus.interface";
import { VehicleStatusColumns } from "./VehicleStatusColumns";

interface Props {
  columns: VehicleStatusColumns[];
  data: VehicleStatusResource[];
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
          code: true,
          description: true,
          use: true,
          color: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
