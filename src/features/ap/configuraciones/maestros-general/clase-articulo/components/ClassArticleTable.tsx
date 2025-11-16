import { DataTable } from "@/src/shared/components/DataTable";
import { ClassArticleResource } from "../lib/classArticle.interface";
import { ClassArticleColumns } from "./ClassArticleColumns";

interface Props {
  columns: ClassArticleColumns[];
  data: ClassArticleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleCategoryTable({
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
          dyn_code: true,
          description: true,
          account: true,
          type: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
