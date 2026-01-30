import { DataTable } from "@/shared/components/DataTable";
import { VehicleAssignmentColumns } from "./VehicleAssignmentColumns";
import { VehicleAssignmentControlResource } from "../lib/vehicleAssignment.interface";

interface Props {
  columns: VehicleAssignmentColumns[];
  data: VehicleAssignmentControlResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleAssignmentTable({
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
