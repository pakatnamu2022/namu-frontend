import { DataTable } from "@/shared/components/DataTable";
import { InternalNoteMigrationColumns } from "./InternalNoteMigrationColumns";
import { InternalNoteMigrationResource } from "../lib/internalNoteMigration.interface";

interface Props {
  columns: InternalNoteMigrationColumns[];
  data: InternalNoteMigrationResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function InternalNoteMigrationTable({
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
