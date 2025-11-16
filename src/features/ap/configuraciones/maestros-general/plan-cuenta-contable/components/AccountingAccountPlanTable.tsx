import { DataTable } from "@/shared/components/DataTable";
import { AccountingAccountPlanResource } from "../lib/accountingAccountPlan.interface";
import { AccountingAccountPlanColumns } from "./AccountingAccountPlanColumns";

interface Props {
  columns: AccountingAccountPlanColumns[];
  data: AccountingAccountPlanResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AccountingAccountPlanTable({
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
          account: true,
          description: true,
          accounting_type_id: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
