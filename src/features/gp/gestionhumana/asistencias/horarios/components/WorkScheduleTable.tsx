import { DataTable } from "@/shared/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import type { WorkScheduleResource } from "../lib/work-schedule.interface";

interface Props {
  columns: ColumnDef<WorkScheduleResource>[];
  data: WorkScheduleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WorkScheduleTable({
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
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
