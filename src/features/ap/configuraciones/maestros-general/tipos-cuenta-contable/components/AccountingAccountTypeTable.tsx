import { DataTable } from "@/src/shared/components/DataTable";
import { AccountingAccountTypeResource } from "../lib/accountingAccountType.interface";
import { AccountingAccountTypeColumns } from "./AccountingAccountTypeColumns";

interface Props {
  columns: AccountingAccountTypeColumns[];
  data: AccountingAccountTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AccountingAccountTypeTable({
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
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
