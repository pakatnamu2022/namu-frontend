import { DataTable } from "@/shared/components/DataTable.tsx";
import { WorkerColumns } from "./WorkerColumns.tsx";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface.ts";

interface Props {
  columns: WorkerColumns[];
  data: WorkerResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WorkerTable({
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
