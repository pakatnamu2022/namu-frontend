import { DataTable } from "@/shared/components/DataTable.tsx";
import { TypesOperationsAppointmentColumns } from "./TypesOperationsAppointmentColumns.tsx";
import { TypesOperationsAppointmentResource } from "@/features/ap/configuraciones/postventa/tipos-operacion-cita/lib/typesOperationsAppointment.interface.ts";

interface Props {
  columns: TypesOperationsAppointmentColumns[];
  data: TypesOperationsAppointmentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypesOperationsAppointmentTable({
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
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
