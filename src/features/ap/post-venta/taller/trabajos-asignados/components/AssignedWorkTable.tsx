import { DataTable } from "@/shared/components/DataTable";
import { WorkOrderPlanningResource } from "../../planificacion-orden-trabajo/lib/workOrderPlanning.interface";
import { WorkOrderPlanningColumns } from "../../planificacion-orden-trabajo/components/PlanningColumns";

interface Props {
  columns: WorkOrderPlanningColumns[];
  data: WorkOrderPlanningResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AssignedWorkTable({
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
          code: true,
          description: true,
          brand: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
