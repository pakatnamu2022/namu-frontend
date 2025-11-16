import { DataTable } from "@/src/shared/components/DataTable";
import { UserColumns } from "./UserColumns";
import { UserResource } from "../lib/user.interface";

interface Props {
  columns: UserColumns[];
  data: UserResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function UserTable({
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
          position: false,
          sede: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
