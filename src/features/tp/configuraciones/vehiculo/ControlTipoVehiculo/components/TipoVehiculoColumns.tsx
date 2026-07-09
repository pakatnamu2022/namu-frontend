"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { TipoVehiculoResource } from "../libs/tipoVehiculo.interface";

export type TipoVehiculoColumns = ColumnDef<TipoVehiculoResource>;

interface Props {
    onDelete: (id: number) => void;
    onUpdate: (id: number) => void;
}

export const tipoVehiculoColumns = ({
    onUpdate,
    onDelete,
}: Props): TipoVehiculoColumns[] => [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ getValue }) => (
                <span className="font-mono text-sm">{getValue() as number}</span>
            ),
        },
        {
            accessorKey: "descripcion",
            header: "Descripción",
            cell: ({ getValue }) => (
                <span className="font-semibold">{getValue() as string}</span>
            ),
        },
        {
            accessorKey: "status_deleted",
            header: "Estado",
            cell: ({ getValue }) => {
                const value = getValue() as number;
                return (
                    <Badge variant="outline" className="capitalize gap-2">
                        {value === 1 ? (
                            <CheckCircle className="size-4 text-primary" />
                        ) : (
                            <XCircle className="size-4 text-secondary" />
                        )}
                        {value === 1 ? "Activo" : "Inactivo"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Creado",
            cell: ({ getValue }) => {
                const value = getValue() as string | undefined;
                if (!value) return <span>-</span>;
                try {
                    const date = new Date(value);
                    return <span>{date.toLocaleDateString('es-PE')}</span>;
                } catch {
                    return <span>-</span>;
                }
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