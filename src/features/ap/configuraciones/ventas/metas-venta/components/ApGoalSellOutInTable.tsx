import { DataTable } from "@/shared/components/DataTable";
import { ApGoalSellOutInColumns } from "./ApGoalSellOutInColumns";
import { ApGoalSellOutInResource } from "../lib/apGoalSellOutIn.interface";

interface Props {
  columns: ApGoalSellOutInColumns[];
  data: ApGoalSellOutInResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  isVisibleColumnFilter?: boolean;
}

export default function ApGoalSellOutInTable({
  columns,
  data,
  children,
  isLoading,
  isVisibleColumnFilter = true,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          period: false,
          goal: true,
          brand: true,
          shop: true,
          type: true,
        }}
        isVisibleColumnFilter={isVisibleColumnFilter}
      >
        {children}
      </DataTable>
    </div>
  );
}
