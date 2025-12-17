import { DataTable } from "@/shared/components/DataTable";
import { PerDiemCategoryResource } from "../lib/perDiemCategory.interface";
import { PerDiemCategoryColumns } from "./PerDiemCategoryColumns";

interface Props {
  columns: PerDiemCategoryColumns[];
  data: PerDiemCategoryResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PerDiemCategoryTable({
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
          name: true,
          description: true,
          active: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
