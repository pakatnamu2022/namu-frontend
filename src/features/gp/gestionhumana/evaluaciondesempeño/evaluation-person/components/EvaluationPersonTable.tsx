import { DataTable } from "@/shared/components/DataTable";
import { EvaluationPersonColumn } from "./EvaluationPersonColumns";
import { EvaluationPersonResultResource } from "../lib/evaluationPerson.interface";
import { EvaluationResource } from "../../evaluaciones/lib/evaluation.interface";

interface Props {
  columns: EvaluationPersonColumn[];
  data: EvaluationPersonResultResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  evaluation: EvaluationResource;
}

export default function EvaluationPersonTable({
  columns,
  data,
  children,
  isLoading,
  evaluation,
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
          supervisor: false,
          competencesResult: evaluation.typeEvaluation !== 0,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
