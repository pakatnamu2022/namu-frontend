import { DataTable } from "@/shared/components/DataTable";
import { GearShiftTypeResource } from "../lib/gearShiftType.interface";
import { GearShiftTypeColumns } from "./GearShiftTypeColumns";

interface Props {
  columns: GearShiftTypeColumns[];
  data: GearShiftTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function GearShiftTypeTable({
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
