"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PhoneLineResource } from "../lib/phoneLine.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Pencil, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PHONE_LINE } from "../lib/phoneLine.constants";

export type PhoneLineColumns = ColumnDef<PhoneLineResource>;

export const phoneLineColumns = ({
  onDelete,
}: {
  onDelete: (id: number) => void;
}): PhoneLineColumns[] => [
  {
    accessorKey: "number",
    header: "Número",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <Badge variant="outline">{value}</Badge>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Activo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      const isActive = value === "1" || value === "true";
      return (
        <Badge variant="outline" className="capitalize gap-2">
          {isActive ? (
            <CheckCircle className="size-4 text-primary" />
          ) : (
            <XCircle className="size-4 text-secondary" />
          )}
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const id = row.original.id;
      const { ROUTE_UPDATE } = PHONE_LINE;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
          >
            <Pencil className="size-5" />
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
