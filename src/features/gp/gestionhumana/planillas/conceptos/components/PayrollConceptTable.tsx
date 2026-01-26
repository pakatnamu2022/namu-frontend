import { DataTable } from "@/shared/components/DataTable";
import { PayrollConceptColumns } from "./PayrollConceptColumns";
import { PayrollConceptResource } from "../lib/payroll-concept.interface";

interface Props {
  columns: PayrollConceptColumns[];
  data: PayrollConceptResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PayrollConceptTable({
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
