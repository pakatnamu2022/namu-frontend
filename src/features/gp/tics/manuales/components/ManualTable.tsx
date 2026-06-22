import { DataTable } from "@/shared/components/DataTable";
import { ManualColumns } from "./ManualColumns";
import { ManualResource } from "../lib/manual.interface";

interface Props {
  columns: ManualColumns[];
  data: ManualResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ManualTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
