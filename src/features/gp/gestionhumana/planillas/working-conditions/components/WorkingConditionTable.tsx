import { DataTable } from "@/shared/components/DataTable";
import { WorkingConditionColumns } from "./WorkingConditionColumns";
import { WorkingConditionResource } from "../lib/working-condition.interface";

interface Props {
  columns: WorkingConditionColumns[];
  data: WorkingConditionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WorkingConditionTable({
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
