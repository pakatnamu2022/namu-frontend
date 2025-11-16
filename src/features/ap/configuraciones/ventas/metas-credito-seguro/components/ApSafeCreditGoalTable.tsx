import { DataTable } from "@/src/shared/components/DataTable";
import { ApSafeCreditGoalColumns } from "./ApSafeCreditGoalColumns";
import { ApSafeCreditGoalResource } from "../lib/apSafeCreditGoal.interface";

interface Props {
  columns: ApSafeCreditGoalColumns[];
  data: ApSafeCreditGoalResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ApSafeCreditGoalTable({
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
          period: false,
          goal_amount: true,
          sede: true,
          type: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
