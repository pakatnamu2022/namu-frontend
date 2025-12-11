import { DataTable } from "@/shared/components/DataTable.tsx";
import { ReasonsAdjustmentColumns } from "./ReasonsAdjustmentColumns.tsx";
import { ReasonsAdjustmentResource } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.interface.ts";

interface Props {
  columns: ReasonsAdjustmentColumns[];
  data: ReasonsAdjustmentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ReasonsAdjustmentTable({
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
