import { DataTable } from "@/shared/components/DataTable";
import { BudgetsColumns } from "./BudgetsColumns";
import { BudgetsResource } from "../lib/budgets.interface";

interface Props {
  columns: BudgetsColumns[];
  data: BudgetsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BudgetsTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
