import { DataTable } from "@/shared/components/DataTable";
import { ShipmentsReceptionsColumns } from "./ShipmentsReceptionsColumns";
import { ShipmentsReceptionsResource } from "../lib/shipmentsReceptions.interface";

interface Props {
  columns: ShipmentsReceptionsColumns[];
  data: ShipmentsReceptionsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ShipmentsReceptionsTable({
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
          document_type: true,
          issue_date: true,
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
          requires_sunat: false,
          reception_checklist: true,
          notes: false,
          note_received: false,
          cancellation_reason: false,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
