import { DataTable } from "@/shared/components/DataTable";
import { EvaluationColumns } from "./EvaluationColumns";
import { EvaluationResource } from "../lib/evaluation.interface";

interface Props {
  columns: EvaluationColumns[];
  data: EvaluationResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function EvaluationTable({
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
          competenceParameter: false,
          objectiveParameter: false,
          finalParameter: false,
          cycle: false,
          send_opened_email: false,
          send_closed_email: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
