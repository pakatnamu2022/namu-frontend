import { DataTable } from "@/shared/components/DataTable";
import { ControlUnitsColumns } from "./ControlUnitsColumns";
import { ControlUnitsResource } from "../lib/controlUnits.interface";

interface Props {
  columns: ControlUnitsColumns[];
  data: ControlUnitsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ControlUnitsTable({
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
          document_type: false,
          issue_date: false,
          transfer_reason_description: true,
          document_series: false,
          document_number: true,
          issuer_type: false,
          transmitter: true,
          receiver: true,
          plate: false,
          driver_name: false,
          license: false,
          transfer_modality: false,
          reception_checklist: true,
          notes: false,
          note_received: false,
          cancellation_reason: false,
          status: false,
          file_url: false,
          created_at: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
