import { DataTable } from "@/shared/components/DataTable";
import { WorkerResource } from "../lib/par-evaluator.interface";
import { ParEvaluatorColumns } from "./ParEvaluatorColumns";

interface Props {
  columns: ParEvaluatorColumns[];
  data: WorkerResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ParEvaluatorTable({
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
          offerLetterConfirmation: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
