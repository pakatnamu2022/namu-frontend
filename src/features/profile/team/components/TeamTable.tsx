import { DataTable } from "@/shared/components/DataTable";
import { TeamColumns } from "./TeamColumns";
import { EvaluationPersonResultResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/lib/evaluationPerson.interface";
import { TeamCard } from "./TeamCard";

interface Props {
  columns: TeamColumns[];
  data: EvaluationPersonResultResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  onEvaluate: (personId: number) => void;
  onHistory: (personId: number) => void;
}

export default function TeamTable({
  columns,
  data,
  children,
  isLoading,
  onEvaluate,
  onHistory,
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
        mobileCardRender={(row) => (
          <TeamCard data={row} onEvaluate={onEvaluate} onHistory={onHistory} />
        )}
      >
        {children}
      </DataTable>
    </div>
  );
}
