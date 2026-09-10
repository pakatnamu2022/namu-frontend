"use client";

import { DataTable } from "@/shared/components/DataTable";
import { SupplyControlTableDesktopProps } from "../lib/supplyControl.interface";


export function SupplyControlTableDesktop({
    columns,
    data,
    children,
    isLoading,
}: SupplyControlTableDesktopProps) {
    return (
        <div className="border-none text-muted-foreground max-w-full">
            <DataTable columns={columns} data={data} isLoading={isLoading}>
                {children}
            </DataTable>
        </div>
    );
}