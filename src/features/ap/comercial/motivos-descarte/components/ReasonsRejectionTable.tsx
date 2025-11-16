import { DataTable } from "@/src/shared/components/DataTable";
import { ReasonsRejectionColumns } from "./ReasonsRejectionColumns";
import { ReasonsRejectionResource } from "../lib/reasonsRejection.interface";

interface Props {
  columns: ReasonsRejectionColumns[];
  data: ReasonsRejectionResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ReasonsRejectionTable({
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
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
