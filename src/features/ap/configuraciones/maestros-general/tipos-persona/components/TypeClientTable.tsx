import { DataTable } from "@/shared/components/DataTable";
import { TypeClientColumns } from "./TypeClientColumns";
import { TypeClientResource } from "../lib/typeClient.interface";

interface Props {
  columns: TypeClientColumns[];
  data: TypeClientResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypeClientTable({
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
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
