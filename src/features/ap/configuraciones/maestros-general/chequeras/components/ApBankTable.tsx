import { DataTable } from "@/shared/components/DataTable";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { ApBankColumns } from "./ApBankColumns";

interface Props {
  columns: ApBankColumns[];
  data: ApBankResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleCategoryTable({
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
          account_number: true,
          cci: false,
          description: true,
          currency: false,
          company_branch: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
