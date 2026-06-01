import { DataTable } from "@/shared/components/DataTable.tsx";
import { ReasonDiscardingTallerColumns } from "./ReasonDiscardingTallerColumns.tsx";
import { ReasonDiscardingTallerResource } from "../lib/reasonDiscardingTaller.interface.ts";

interface Props {
  columns: ReasonDiscardingTallerColumns[];
  data: ReasonDiscardingTallerResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ReasonDiscardingTallerTable({
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
