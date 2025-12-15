import { DataTable } from "@/shared/components/DataTable.tsx";
import { PositionColumns } from "./PositionColumns.tsx";
import { PositionResource } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.interface.ts";

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
          name: true,
          descripcion: false,
          area: true,
          position_head_name: true,
          hierarchical_category_name: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
