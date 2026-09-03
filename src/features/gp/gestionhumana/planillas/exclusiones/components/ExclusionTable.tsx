import { DataTable } from "@/shared/components/DataTable";
import { ExclusionColumns } from "./ExclusionColumns";
import { ExclusionResource } from "../lib/exclusion.interface";

interface Props {
  columns: ExclusionColumns[];
  data: ExclusionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ExclusionTable({
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
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
