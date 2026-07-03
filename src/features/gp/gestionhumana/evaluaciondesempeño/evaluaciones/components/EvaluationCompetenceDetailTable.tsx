import type { RowSelectionState, OnChangeFn } from "@tanstack/react-table";
import { DataTable } from "@/shared/components/DataTable";
import { EvaluationPersonCompetenceDetailResource } from "../lib/evaluationPersonCompetenceDetail.interface";
import { EvaluationCompetenceDetailColumn } from "./EvaluationCompetenceDetailColumns";

interface Props {
  columns: EvaluationCompetenceDetailColumn[];
  data: EvaluationPersonCompetenceDetailResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
}

export default function EvaluationCompetenceDetailTable({
  columns,
  data,
  children,
  isLoading,
  rowSelection,
  onRowSelectionChange,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        getRowId={(row) => String(row.id)}
      >
        {children}
      </DataTable>
    </div>
  );
}
