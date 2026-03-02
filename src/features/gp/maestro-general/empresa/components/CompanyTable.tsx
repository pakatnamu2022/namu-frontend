import { DataTable } from "@/shared/components/DataTable";
import { CompanyColumns } from "./CompanyColumns";
import { CompanyResource } from "../lib/company.interface";

interface Props {
  columns: CompanyColumns[];
  data: CompanyResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CompanyTable({
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
          name: true,
          abbreviation: true,
          businessName: true,
          email: true,
          phone: true,
          city: true,
          address: false,
          website: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
