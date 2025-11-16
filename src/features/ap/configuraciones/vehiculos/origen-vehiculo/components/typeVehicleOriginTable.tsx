import { DataTable } from "@/shared/components/DataTable";
import { TypeVehicleOriginResource } from "../lib/typeVehicleOrigin.interface";
import { TypeVehicleOriginColumns } from "./typeVehicleOriginColumns";

interface Props {
  columns: TypeVehicleOriginColumns[];
  data: TypeVehicleOriginResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypeVehicleOriginTable({
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
