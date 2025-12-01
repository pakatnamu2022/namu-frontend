import { DataTable } from "@/shared/components/DataTable";
import { ReasonsAdjustmentColumns } from "./ReasonsAdjustmentColumns";
import { ReasonsAdjustmentResource } from "../lib/reasonsAdjustment.interface";

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
