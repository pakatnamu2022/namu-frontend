import { DataTable } from "@/shared/components/DataTable.tsx";
import { ReasonDiscardingSparePartColumns } from "./ReasonDiscardingSparePartColumns.tsx";
import { ReasonDiscardingSparePartResource } from "../lib/reasonDiscardingSparePart.interface.ts";

interface Props {
  columns: ReasonDiscardingSparePartColumns[];
  data: ReasonDiscardingSparePartResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ReasonDiscardingSparePartTable({
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
