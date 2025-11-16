import { DataTable } from "@/src/shared/components/DataTable";
import { CompetenceColumns } from "./CompetenceColumns";
import { CompetenceResource } from "../lib/competence.interface";

interface Props {
  columns: CompetenceColumns[];
  data: CompetenceResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CompetenceTable({
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
