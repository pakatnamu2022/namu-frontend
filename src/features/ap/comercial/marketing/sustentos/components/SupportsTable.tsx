import { DataTable } from "@/shared/components/DataTable";
import { SupportsColumns } from "./SupportsColumns";
import { SupportsResource } from "../lib/supports.interface";

interface Props {
  columns: SupportsColumns[];
  data: SupportsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function SupportsTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
