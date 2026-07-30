import { DataTable } from "@/shared/components/DataTable";
import { AccountingAccountPlanResource } from "../lib/accountingAccountPlan.interface";
import { AccountingAccountPlanColumns } from "./AccountingAccountPlanColumns";
import type { SortingState, OnChangeFn } from "@tanstack/react-table";

interface Props {
  columns: AccountingAccountPlanColumns[];
  data: AccountingAccountPlanResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
}

export default function AccountingAccountPlanTable({
  columns,
  data,
  children,
  isLoading,
  sorting,
  onSortingChange,
  manualSorting,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={onSortingChange}
        manualSorting={manualSorting}
        initialColumnVisibility={{
          account: true,
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
