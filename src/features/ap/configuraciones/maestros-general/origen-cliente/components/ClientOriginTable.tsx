import { DataTable } from "@/src/shared/components/DataTable";
import { ClientOriginResource } from "../lib/clientOrigin.interface";
import { ClientOriginColumns } from "./ClientOriginColumns";

interface Props {
  columns: ClientOriginColumns[];
  data: ClientOriginResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ClientOriginTable({
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
