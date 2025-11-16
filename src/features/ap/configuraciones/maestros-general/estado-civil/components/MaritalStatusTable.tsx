import { DataTable } from "@/shared/components/DataTable";
import { MaritalStatusColumns } from "./MaritalStatusColumns";
import { MaritalStatusResource } from "../lib/maritalStatus.interface";

interface Props {
  columns: MaritalStatusColumns[];
  data: MaritalStatusResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function MaritalStatusTable({
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
