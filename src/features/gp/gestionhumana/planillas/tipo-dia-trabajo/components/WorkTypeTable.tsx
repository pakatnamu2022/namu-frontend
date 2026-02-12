import { DataTable } from "@/shared/components/DataTable";
import { WorkTypeColumns } from "./WorkTypeColumns";
import { WorkTypeResource } from "../lib/work-type.interface";

interface Props {
  columns: WorkTypeColumns[];
  data: WorkTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function WorkTypeTable({
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
