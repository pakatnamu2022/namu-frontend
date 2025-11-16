import { DataTable } from "@/shared/components/DataTable";
import { DocumentTypeColumns } from "./DocumentTypesColumns";
import { DocumentTypeResource } from "../lib/documentTypes.interface";

interface Props {
  columns: DocumentTypeColumns[];
  data: DocumentTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function DocumentTypeTable({
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
          description: true,
          code: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
