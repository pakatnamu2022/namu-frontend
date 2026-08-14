import { DataTable } from "@/shared/components/DataTable";
import { KpisColumns } from "./KpisColumns";
import { KpisResource } from "../lib/kpis.interface";

interface Props {
  columns: KpisColumns[];
  data: KpisResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function KpisTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
