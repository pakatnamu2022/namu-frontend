import { DataTable } from "@/shared/components/DataTable";
import { EquipmentColumns } from "./EquipmentColumns";
import { EquipmentResource } from "@/features/gp/tics/equipment/lib/equipment.interface";

interface Props {
  columns: EquipmentColumns[];
  data: EquipmentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function EquipmentTable({
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
          estado_uso: false,
          status: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
