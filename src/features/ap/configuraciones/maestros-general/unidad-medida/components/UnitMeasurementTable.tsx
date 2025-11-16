import { DataTable } from "@/shared/components/DataTable";
import { UnitMeasurementColumns } from "./UnitMeasurementColumns";
import { UnitMeasurementResource } from "../lib/unitMeasurement.interface";

interface Props {
  columns: UnitMeasurementColumns[];
  data: UnitMeasurementResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function UnitMeasurementTable({
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
          nubefac_code: true,
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
