import { DataTable } from "@/shared/components/DataTable";
import { TypeGenderColumns } from "./TypesGenderColumns";
import { TypeGenderResource } from "../lib/typesGender.interface";

interface Props {
  columns: TypeGenderColumns[];
  data: TypeGenderResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TypeGenderTable({
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
