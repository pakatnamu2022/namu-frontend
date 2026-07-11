"use client";

import { ColumnDef } from "@tanstack/react-table";
import { VehiculoResource } from "../libs/vehiculo.interface";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type VehiculoColumns = ColumnDef<VehiculoResource>;

interface Props {
    onDelete: (id: number) => void;
    onUpdate: (id: number) => void;
}

export const vehiculoColumns = ({
    onUpdate,
    onDelete,
}: Props): VehiculoColumns[] => [
        {
            accessorKey: "placa",
            header: "Placa",
            cell: ({ getValue }) => (
                <span className="font-semibold uppercase">{getValue() as string}</span>
            ),
        },
        {
            accessorKey: "tipo_vehiculo_descripcion",
            header: "Tipo Vehículo",
            cell: ({ getValue }) => {
                const value = getValue() as string | undefined;
                return <span>{value || "-"}</span>;
            },
        },
        {
            accessorKey: "sede_abreviatura",
            header: "Sede",
            cell: ({ getValue }) => {
                const value = getValue() as string | undefined;
                return <span>{value || "-"}</span>;
            },
        },
        {
            accessorKey: "modelo",
            header: "Modelo",
            cell: ({ getValue }) => {
                const value = getValue() as string | null;
                return <span>{value || "-"}</span>;
            },
        },
        {
            accessorKey: "marca",
            header: "Marca",
            cell: ({ getValue }) => {
                const value = getValue() as string | null;
                return <span>{value || "-"}</span>;
            },
        },
        {
            accessorKey: "capacidad_util",
            header: "Cap. Útil",
            cell: ({ getValue }) => {
                const value = getValue() as number | null;
                return <span>{value ?? "-"}</span>;
            },
        },
        {
            accessorKey: "vehiculo_status",
            header: "Estado",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return (
                    <Badge variant="outline" className="capitalize gap-2">
                        {value === 1 ? (
                            <CheckCircle className="size-4 text-primary" />
                        ) : (
                            <XCircle className="size-4 text-destructive" />
                        )}
                        {value === 1 ? "Activo" : "Inactivo"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "status_deleted",
            header: "Eliminado",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return (
                    <Badge variant="outline" className="capitalize gap-2">
                        {value === 1 ? (
                            <CheckCircle className="size-4 text-primary" />
                        ) : (
                            <XCircle className="size-4 text-destructive" />
                        )}
                        {value === 1 ? "Activo" : "Inactivo"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
                const id = row.original.id;
                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-7"
                            onClick={() => onUpdate(id)}
                        >
                            <Pencil className="size-5" />
                        </Button>
                        <DeleteButton onClick={() => onDelete(id)} />
                    </div>
                );
            },
        },
    ];