import { DataTable } from "@/shared/components/DataTable";
import { AppointmentPlanningColumns } from "./AppointmentPlanningColumns";
import { AppointmentPlanningResource } from "../lib/appointmentPlanning.interface";

interface Props {
  columns: AppointmentPlanningColumns[];
  data: AppointmentPlanningResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AppointmentPlanningTable({
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
          full_name_client: true,
          plate: true,
          email_client: false,
          phone_client: false,
          date_appointment: true,
          time_appointment: true,
          description: false,
          is_taken: true,
          created_by_name: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
