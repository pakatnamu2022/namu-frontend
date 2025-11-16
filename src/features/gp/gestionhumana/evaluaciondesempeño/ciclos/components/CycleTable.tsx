import { DataTable } from "@/shared/components/DataTable";
import { CycleColumns } from "./CycleColumns";
import { CycleResource } from "../lib/cycle.interface";

interface Props {
  columns: CycleColumns[];
  data: CycleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CycleTable({
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
          description: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
