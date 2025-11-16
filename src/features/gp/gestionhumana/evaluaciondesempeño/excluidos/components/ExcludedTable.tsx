import { DataTable } from "@/shared/components/DataTable";
import { ExcludedColumns } from "./ExcludedColumns";
import { EvaluationPersonDetailResource } from "../lib/excluded.interface";

interface Props {
  columns: ExcludedColumns[];
  data: EvaluationPersonDetailResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ExcludedTable({
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
