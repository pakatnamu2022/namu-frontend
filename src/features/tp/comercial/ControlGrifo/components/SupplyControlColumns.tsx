"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Truck,
    User,
    Camera,
    Pencil,
    Eye,
    Building2
} from "lucide-react";
import { SupplyControlResource } from "../lib/supplyControl.interface";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { SupplyControlDetailModal } from "./SupplyControlDetailModal";

export type SupplyControlColumns = ColumnDef<SupplyControlResource>;

interface Props {
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;
    onStatusChange?: (recordId: number, newStatus: 'active' | 'inactive') => void;
    permissions: {
        canUpdate: boolean;
        canDelete: boolean;
        canExport: boolean;
    };
}

export const SupplyControlColumns = ({
    onEdit,
    onDelete,
    onStatusChange,
    permissions,
}: Props): SupplyControlColumns[] => [
        {
            accessorKey: "id",
            header: "N°",
            cell: ({ row }) => (
                <span className="font-mono text-sm font-medium">
                    #{row.original.id}
                </span>
            ),
        },
        {
            accessorKey: "vehicle.placa",
            header: "Placa",
            cell: ({ row }) => {
                const vehicle = row.original.vehicle;
                return (
                    <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="font-mono">
                            {vehicle?.placa || "N/A"}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: "driver.nombre_completo",
            header: "Conductor",
            cell: ({ row }) => {
                const driver = row.original.driver;
                return (
                    <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{driver?.nombre_completo || "N/A"}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "supplier.name",
            header: "Grifo",
            cell: ({ row }) => {
                const supplier = row.original.supplier;
                return (
                    <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{supplier?.name || "N/A"}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "mileage",
            header: "Kilometraje",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return (
                    <span className="font-mono font-medium">
                        {value ? String(value) : "-"} km
                    </span>
                );
            },
        },
        {
            accessorKey: "gallons",
            header: "Galones",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return (
                    <span className="font-mono font-medium text-blue-600">
                        {value?.toFixed(3) || "-"}
                    </span>
                );
            },
        },
        {
            accessorKey: "is_base",
            header: "Ubicación",
            cell: ({ getValue }) => {
                const isBase = getValue() as boolean;
                return (
                    <Badge
                        variant="outline"
                        className={isBase ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}
                    >
                        {isBase ? "En Base" : "Fuera de Base"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "photo_id",
            header: "Vale",
            cell: ({ getValue }) => {
                const photoId = getValue() as number | null;
                return photoId ? (
                    <Badge variant="outline" className="gap-1">
                        <Camera className="h-3 w-3" />
                        <span>Sí</span>
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                        No
                    </Badge>
                );
            },
        },
        {
            accessorKey: "recorded_at_formatted",
            header: "Fecha/Hora",
            cell: ({ getValue }) => (
                <span className="text-sm text-muted-foreground">
                    {getValue() as string || "-"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const record = row.original;

                return (
                    <div className="flex items-center gap-1">
                        {/* Modal de detalle */}
                        <SupplyControlDetailModal
                            record={record}
                            permissions={permissions}
                            onStatusChange={onStatusChange}
                            trigger={
                                <Button
                                    tooltip="Ver Detalle"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                >
                                    <Eye className="size-4" />
                                </Button>
                            }
                        />

                        {/* Editar */}
                        {permissions.canUpdate && onEdit && (
                            <Button
                                tooltip="Editar"
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => onEdit(record.id)}
                            >
                                <Pencil className="size-4" />
                            </Button>
                        )}

                        {/* Eliminar/Anular */}
                        {permissions.canDelete && onDelete && (
                            <DeleteButton
                                onClick={() => onDelete(record.id)}
                            />
                        )}
                    </div>
                );
            },
        },
    ];