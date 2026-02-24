import { DataTable } from "@/shared/components/DataTable";
import { AttendanceRuleColumns } from "./AttendanceRuleColumns";
import { AttendanceRuleResource } from "../lib/attendance-rule.interface";

interface Props {
  columns: AttendanceRuleColumns[];
  data: AttendanceRuleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AttendanceRuleTable({
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
