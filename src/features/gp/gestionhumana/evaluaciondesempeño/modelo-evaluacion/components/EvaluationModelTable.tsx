import { DataTable } from "@/shared/components/DataTable";
import type { EvaluationModelResource } from "../lib/evaluationModel.interface";
import { evaluationModelColumns } from "./EvaluationModelColumns";

interface Props {
  data: EvaluationModelResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function EvaluationModelTable({
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={evaluationModelColumns}
        data={data}
        isLoading={isLoading}
      >
        {children}
      </DataTable>
    </div>
  );
}
