import { DataTable } from "@/shared/components/DataTable";
import { VehicleTypeResource } from "../lib/vehicleType.interface";
import { VehicleTypeColumns } from "./VehicleTypeColumns";

interface Props {
  columns: VehicleTypeColumns[];
  data: VehicleTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleTypeTable({
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
