import { DataTable } from "@/src/shared/components/DataTable";
import { ReceptionChecklistResource } from "../lib/receptionChecklist.interface";
import { ReceptionChecklistColumns } from "./ReceptionChecklistColumns";

interface Props {
  columns: ReceptionChecklistColumns[];
  data: ReceptionChecklistResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ReceptionChecklistTable({
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
          description: true,
          category: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
