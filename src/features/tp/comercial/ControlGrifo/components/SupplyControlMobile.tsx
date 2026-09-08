"use client";

import { SupplyControlTableDesktop } from "./SupplyControlTableDesktop";
import { SupplyFab } from "./SupplyFab";
import { SupplyControlColumns } from "./SupplyControlColumns";
import { SupplyControlTableMobile } from "./SupplyControlTable";
import { SupplyControlMobileProps } from "../lib/supplyControl.interface";



export function SupplyControlMobile({
    data,
    isLoading,
    onRefresh,
    onAdd,
    permissions,
    isDriver = false,
}: SupplyControlMobileProps) {
    if (isDriver) {
        return (
            <div className="relative">
                <SupplyControlTableMobile
                    data={data}
                    isLoading={isLoading}
                    onRefresh={onRefresh}
                    onAdd={onAdd}
                    permissions={permissions}
                />
                {permissions.canCreate && onAdd && (
                    <SupplyFab onClick={onAdd} />
                )}
            </div>
        );
    }

    return (
        <SupplyControlTableDesktop
            columns={SupplyControlColumns({
                onEdit: permissions.canUpdate ? onRefresh : undefined,
                onDelete: permissions.canDelete ? onRefresh : undefined,
                permissions,
            })}
            data={data}
            isLoading={isLoading}
        />
    );
}