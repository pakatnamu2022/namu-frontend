import { DataTable } from "@/src/shared/components/DataTable";
import { EvaluationPersonColumn } from "./EvaluationPersonColumns";
import { EvaluationPersonResultResource } from "../lib/evaluationPerson.interface";

interface Props {
  columns: EvaluationPersonColumn[];
  data: EvaluationPersonResultResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function EvaluationPersonTable({
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
          position: false,
          sede: false,
          area: false,
          category: false,
          chief: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
