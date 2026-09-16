import { DataTable } from "@/shared/components/DataTable";
import { ContractTemplateColumns } from "./ContractTemplateColumns.tsx";
import { ContractTemplateResource } from "../lib/contractTemplate.interface.ts";

interface Props {
  columns: ContractTemplateColumns[];
  data: ContractTemplateResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ContractTemplateTable({
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
