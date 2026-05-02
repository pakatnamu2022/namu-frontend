import { DataTable } from "@/shared/components/DataTable";
import { ElectronicDocumentColumn } from "./ElectronicDocumentColumns";
import { ElectronicDocumentResource } from "../lib/electronicDocument.interface";

interface Props {
  columns: ElectronicDocumentColumn[];
  data: ElectronicDocumentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ElectronicDocumentTable({
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
          documentType: false,
          area_id: false,
          internal_note: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
