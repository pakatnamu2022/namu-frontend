"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TelephoneAccountResource } from "../lib/telephoneAccount.interface";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TelephoneAccountColumnsProps {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const telephoneAccountColumns = ({
  onDelete,
  onEdit,
}: TelephoneAccountColumnsProps): ColumnDef<TelephoneAccountResource>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.id}</div>;
    },
  },
  {
    accessorKey: "company",
    header: "Empresa",
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.company}</div>;
    },
  },
  {
    accessorKey: "account_number",
    header: "Número de Cuenta",
    cell: ({ row }) => {
      return (
        <div className="text-sm font-mono">{row.original.account_number}</div>
      );
    },
  },
  {
    accessorKey: "operator",
    header: "Operador",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          <Badge className="px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
            {row.original.operator ?? "-"}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(account.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(account.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
