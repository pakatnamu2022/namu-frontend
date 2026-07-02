import { DataTable } from "@/shared/components/DataTable";
import { AttendanceExclusionColumns } from "./AttendanceExclusionColumns";
import { AttendanceExclusionResource } from "../lib/attendance-exclusion.interface";

interface Props {
  columns: AttendanceExclusionColumns[];
  data: AttendanceExclusionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AttendanceExclusionTable({
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
