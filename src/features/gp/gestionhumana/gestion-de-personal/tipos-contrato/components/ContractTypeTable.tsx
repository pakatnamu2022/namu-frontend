import { DataTable } from "@/shared/components/DataTable";
import { ContractTypeColumns } from "./ContractTypeColumns.tsx";
import { ContractTypeResource } from "../lib/contractType.interface.ts";

interface Props {
  columns: ContractTypeColumns[];
  data: ContractTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ContractTypeTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
