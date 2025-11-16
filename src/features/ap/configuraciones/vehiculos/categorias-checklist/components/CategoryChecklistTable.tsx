import { DataTable } from "@/shared/components/DataTable";
import { CategoryChecklistResource } from "../lib/categoryChecklist.interface";
import { CategoryChecklistColumns } from "./CategoryChecklistColumns";

interface Props {
  columns: CategoryChecklistColumns[];
  data: CategoryChecklistResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CategoryChecklistTable({
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
        initialColumnVisibility={{
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
