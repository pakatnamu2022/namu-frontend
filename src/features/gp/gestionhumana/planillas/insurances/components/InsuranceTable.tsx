import { DataTable } from "@/shared/components/DataTable";
import { InsuranceColumns } from "./InsuranceColumns";
import { InsuranceResource } from "../lib/insurance.interface";

interface Props {
  columns: InsuranceColumns[];
  data: InsuranceResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function InsuranceTable({
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
