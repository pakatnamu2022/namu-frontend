import { DataTable } from "@/src/shared/components/DataTable";
import { VehicleColorResource } from "../lib/vehicleColor.interface";
import { VehicleColorColumns } from "./VehicleColorColumns";

interface Props {
  columns: VehicleColorColumns[];
  data: VehicleColorResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleColorTable({
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
