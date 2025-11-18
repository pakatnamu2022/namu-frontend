import { DataTable } from "@/shared/components/DataTable";
import { TeamColumns } from "./TeamColumns";
import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";

interface Props {
  columns: TeamColumns[];
  data: EvaluationPersonResultResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TeamTable({
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
          sede: false,
          objectivesResult: false,
          competencesResult: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
