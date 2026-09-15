import { DataTable } from "@/shared/components/DataTable";
import { ContractColumns } from "./ContractColumns.tsx";
import { ContractResource } from "../lib/contract.interface.ts";

interface Props {
  columns: ContractColumns[];
  data: ContractResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ContractTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
