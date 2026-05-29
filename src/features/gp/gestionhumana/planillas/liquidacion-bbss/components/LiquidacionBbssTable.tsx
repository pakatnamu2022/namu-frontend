import { DataTable } from "@/shared/components/DataTable";
import { LiquidacionBbssColumns } from "./LiquidacionBbssColumns";
import { LiquidacionBbssResource } from "../lib/liquidacion-bbss.interface";

interface Props {
  columns: LiquidacionBbssColumns[];
  data: LiquidacionBbssResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function LiquidacionBbssTable({
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
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
