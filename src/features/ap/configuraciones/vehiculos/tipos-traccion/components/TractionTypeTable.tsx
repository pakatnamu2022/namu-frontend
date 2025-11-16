import { DataTable } from "@/src/shared/components/DataTable";
import { TractionTypeResource } from "../lib/tractionType.interface";
import { TractionTypeColumns } from "./TractionTypeColumns";

interface Props {
  columns: TractionTypeColumns[];
  data: TractionTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TractionTypeTable({
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
