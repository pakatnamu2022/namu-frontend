import { DataTable } from "@/shared/components/DataTable";
import { HierarchicalCategoryResource } from "../lib/hierarchicalCategory.interface";
import { HierarchicalCategoryColumns } from "./HierarchicalCategoryColumns";

interface Props {
  columns: HierarchicalCategoryColumns[];
  data: HierarchicalCategoryResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function HierarchicalCategoryTable({
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
          description: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
