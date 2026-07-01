import { DataTable } from "@/shared/components/DataTable";
import { AttendanceCodeMappingColumns } from "./AttendanceCodeMappingColumns";
import { AttendanceCodeMappingResource } from "../lib/attendance-code-mapping.interface";

interface Props {
  columns: AttendanceCodeMappingColumns[];
  data: AttendanceCodeMappingResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AttendanceCodeMappingTable({
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
