"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { SignerResource } from "../lib/signer.interface.ts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { SIGNER } from "../lib/signer.constant.ts";
import { formatDate } from "@/core/core.function.ts";

export type SignerColumns = ColumnDef<SignerResource>;

export const signerColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): SignerColumns[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "sede_abreviatura",
    header: "Sede",
    cell: ({ row }) => row.original.sede_abreviatura ?? "-",
  },
  {
    id: "certificado",
    header: "Certificado",
    cell: ({ row }) => {
      const complete = row.original.has_certificate && row.original.has_key;
      const color = complete ? "#16a34a" : "#dc2626";
      return (
        <Badge
          variant="outline"
          style={{ backgroundColor: `${color}20`, color, borderColor: color }}
        >
          {complete ? "Configurado" : "Incompleto"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "fecha_vencimiento",
    header: "Vencimiento",
    cell: ({ row }) => formatDate(row.original.fecha_vencimiento),
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { ROUTE_UPDATE } = SIGNER;
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="size-7">
            <Link to={`${ROUTE_UPDATE}/${id}`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
