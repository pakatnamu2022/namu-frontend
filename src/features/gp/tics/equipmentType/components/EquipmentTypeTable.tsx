import { DataTable } from "@/shared/components/DataTable";
import { EquipmentTypeColumns } from "./EquipmentTypeColumns";
import { EquipmentTypeResource } from "../lib/equipmentType.interface";

interface Props {
  columns: EquipmentTypeColumns[];
  data: EquipmentTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function EquipmentTypeTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
