import { DataTable } from "@/shared/components/DataTable";
import { PayrollPeriodColumns } from "./PayrollPeriodColumns";
import { PayrollPeriodResource } from "../lib/payroll-period.interface";

interface Props {
  columns: PayrollPeriodColumns[];
  data: PayrollPeriodResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PayrollPeriodTable({
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
