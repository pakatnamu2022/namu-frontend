import { DataTable } from "@/shared/components/DataTable";
import { SignerColumns } from "./SignerColumns.tsx";
import { SignerResource } from "../lib/signer.interface.ts";

interface Props {
  columns: SignerColumns[];
  data: SignerResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function SignerTable({ columns, data, children, isLoading }: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
