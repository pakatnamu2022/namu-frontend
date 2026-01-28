import { DataTable } from "@/shared/components/DataTable";
import { FreightColumns } from "./FreightColumns";
import { FreightControlResource } from "../lib/freightControl.interface";


interface Props {
    columns: FreightColumns[];
    data: FreightControlResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function FreightTable({
    columns,
    data,
    children,
    isLoading,
}: Props){
    return (
        <div className="border-none text-muted-foreground max-w-full">
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
            >
                {children}
            </DataTable>

        </div>
    )
}