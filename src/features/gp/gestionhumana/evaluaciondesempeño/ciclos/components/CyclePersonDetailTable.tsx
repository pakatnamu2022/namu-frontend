import { DataTable } from "@/src/shared/components/DataTable";
import { CyclePersonDetailResource } from "../lib/cyclePersonDetail";
import { CyclePersonDetailColumn } from "./CyclePersonDetailColumns";

interface Props {
  columns: CyclePersonDetailColumn[];
  data: CyclePersonDetailResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CyclePersonDetailTable({
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
          position: false,
          sede: false,
          area: false,
          category: false,
          chief: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
