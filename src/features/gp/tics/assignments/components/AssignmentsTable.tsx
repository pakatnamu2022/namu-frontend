import { DataTable } from "@/shared/components/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function AssignmentsTable<T>({
  columns,
  data,
  isLoading,
  children,
}: Props<T>) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
