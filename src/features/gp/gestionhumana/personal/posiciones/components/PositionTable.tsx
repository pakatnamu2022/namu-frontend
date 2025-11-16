import { DataTable } from "@/shared/components/DataTable";
import { PositionColumns } from "./PositionColumns";
import { PositionResource } from "../lib/position.interface";

interface Props {
  columns: PositionColumns[];
  data: PositionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PositionTable({
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
          descripcion: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
