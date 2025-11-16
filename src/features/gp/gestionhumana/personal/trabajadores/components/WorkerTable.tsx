import { DataTable } from "@/shared/components/DataTable";
import { WorkerColumns } from "./WorkerColumns";
import { WorkerResource } from "../lib/worker.interface";

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
