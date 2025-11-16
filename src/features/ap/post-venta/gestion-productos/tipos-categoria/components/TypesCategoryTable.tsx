import { DataTable } from "@/src/shared/components/DataTable";
import { TypesCategoryResource } from "../lib/typesCategory.interface";
import { TypesCategoryColumns } from "./TypesCategoryColumns";

interface Props {
  columns: TypesCategoryColumns[];
  data: TypesCategoryResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypesCategoryTable({
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
          code: true,
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
