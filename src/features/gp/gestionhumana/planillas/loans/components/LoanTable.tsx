import { DataTable } from "@/shared/components/DataTable";
import { LoanColumns } from "./LoanColumns";
import { LoanResource } from "../lib/loan.interface";

interface Props {
  columns: LoanColumns[];
  data: LoanResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function LoanTable({
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
