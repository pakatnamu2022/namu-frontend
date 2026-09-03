import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function LiquidacionBbssTable<T>({
  columns,
  data,
  children,
  isLoading,
}: Props<T>) {
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
