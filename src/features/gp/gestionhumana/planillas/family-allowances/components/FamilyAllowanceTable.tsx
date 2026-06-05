import { DataTable } from "@/shared/components/DataTable";
import { FamilyAllowanceColumns } from "./FamilyAllowanceColumns";
import { FamilyAllowanceResource } from "../lib/family-allowance.interface";

interface Props {
  columns: FamilyAllowanceColumns[];
  data: FamilyAllowanceResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function FamilyAllowanceTable({
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
