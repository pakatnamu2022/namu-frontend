import { DataTable } from "@/shared/components/DataTable";
import { ObjectiveColumns } from "./ObjectiveColumns";
import { ObjectiveResource } from "../lib/objective.interface";

interface Props {
  columns: ObjectiveColumns[];
  data: ObjectiveResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ObjectiveTable({
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
