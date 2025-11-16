import { DataTable } from "@/shared/components/DataTable";
import { ParameterColumns } from "./ParameterColumns";
import { ParameterResource } from "../lib/parameter.interface";

interface Props {
  columns: ParameterColumns[];
  data: ParameterResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ParameterTable({
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
