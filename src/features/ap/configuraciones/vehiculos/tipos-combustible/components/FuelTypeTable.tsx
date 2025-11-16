import { DataTable } from "@/shared/components/DataTable";
import { FuelTypeResource } from "../lib/fuelType.interface";
import { FuelTypeColumns } from "./FuelTypeColumns";

interface Props {
  columns: FuelTypeColumns[];
  data: FuelTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function FuelTypeTable({
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
          electric_motor: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
