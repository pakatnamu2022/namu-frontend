import { DataTable } from "@/shared/components/DataTable.tsx";
import { TypesPlanningColumns } from "./TypesPlanningColumns.tsx";
import { TypesPlanningResource } from "../lib/typesPlanning.interface.ts";

interface Props {
  columns: TypesPlanningColumns[];
  data: TypesPlanningResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypesPlanningTable({
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
