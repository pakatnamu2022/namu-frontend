import { DataTable } from "@/src/shared/components/DataTable";
import { BankResource } from "../lib/bank.interface";
import { BankColumns } from "./BankColumns";

interface Props {
  columns: BankColumns[];
  data: BankResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BankTable({
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
