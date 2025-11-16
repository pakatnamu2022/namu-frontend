import { DataTable } from "@/src/shared/components/DataTable";
import { FamiliesResource } from "../lib/families.interface";
import { FamiliesColumns } from "./FamiliesColumns";

interface Props {
  columns: FamiliesColumns[];
  data: FamiliesResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function FamiliesTable({
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
          brand: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
