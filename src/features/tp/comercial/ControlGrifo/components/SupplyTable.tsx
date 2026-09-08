import { DataTable } from "@/shared/components/DataTable";
import { SupplyControlColumns } from "./SupplyControlColumns";
import { SupplyControlResource } from "../lib/supplyControl.interface";

interface Props {
    columns: SupplyControlColumns[];
    data: SupplyControlResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function SupplyTable({
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