import { DataTable } from "@/shared/components/DataTable";
import { VehicleColumns } from "./VehicleColumns";
import { VehicleResource } from "../lib/vehicles.interface";

interface Props {
  columns: VehicleColumns[];
  data: VehicleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleTable({
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
          owner_name: false,
          vin: true,
          plate: true,
          model: true,
          year: true,
          engine_number: true,
          vehicle_color: true,
          engine_type: true,
          sede: true,
          warehouse_physical: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
