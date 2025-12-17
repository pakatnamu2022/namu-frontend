import { DataTable } from "@/shared/components/DataTable";
import { HotelAgreementResource } from "../lib/hotelAgreement.interface";
import { HotelAgreementColumns } from "./HotelAgreementColumns";

interface Props {
  columns: HotelAgreementColumns[];
  data: HotelAgreementResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function HotelAgreementTable({
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
          city: true,
          name: true,
          corporate_rate: true,
          includes_breakfast: true,
          includes_parking: true,
          phone: true,
          address: true,
          active: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
