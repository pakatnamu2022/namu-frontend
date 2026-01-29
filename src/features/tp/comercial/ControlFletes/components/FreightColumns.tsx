"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FreightControlResource } from "../lib/freightControl.interface";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";

export type FreightColumns = ColumnDef<FreightControlResource>;

interface Props {
    onDelete: (id: number) => void;
    onUpdate: (id: number) => void;
}

export const freightColumns = (
    {onUpdate, onDelete}: Props
)

: FreightColumns[] => [
    {
        accessorKey: "customer",
        header: "Cliente",
        cell: ({ getValue }) => (
            <span className="font-semibold">{getValue() as string}</span>
        ),
    },
    {
        accessorKey: "startPoint",
        header: "Origen",
    },
    {
        accessorKey: "endPoint",
        header: "Destino",
    },
    {
        accessorKey: "tipo_flete",
        header: "Tipo Flete",
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return <Badge variant="outline">{value}</Badge>
        }
    },
    {
        accessorKey: "freight",
        header: "Flete",
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
                    ): (
                        <XCircle className="size-4 text-secondary" />
                    )}
                    { value === 1 ? "Activo" : "Inactivo" }
                </Badge>
            );
        },
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
            const id = row.original.id;
            return  (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-7"
                        onClick={()=> onUpdate(id)}    
                    >
                        <Pencil className="size-5" />

                    </Button>

                    {/*Delete*/}
                    <DeleteButton onClick={() => onDelete(id)} />
                </div>
            )
        }
    }
]