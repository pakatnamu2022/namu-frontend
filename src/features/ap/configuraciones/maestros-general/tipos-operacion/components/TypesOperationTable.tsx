import { DataTable } from "@/shared/components/DataTable";
import { TypesOperationColumns } from "./TypesOperationColumns";
import { TypesOperationResource } from "../lib/typesOperation.interface";

interface Props {
  columns: TypesOperationColumns[];
  data: TypesOperationResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypesOperationTable({
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
