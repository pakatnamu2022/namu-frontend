"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { HotelAgreementResource } from "../lib/hotelAgreement.interface";
import { Button } from "@/components/ui/button";
import { Pencil, CheckCircle2, XCircle } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export type HotelAgreementColumns = ColumnDef<HotelAgreementResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
  onToggleActive: (id: number) => void;
  permissions: {
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export const hotelAgreementColumns = ({
  onUpdate,
  onDelete,
  onToggleActive,
  permissions,
}: Props): HotelAgreementColumns[] => [
  {
    accessorKey: "city",
    header: "Ciudad",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "name",
    header: "Hotel",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p>{value}</p>;
    },
  },
  {
    accessorKey: "corporate_rate",
    header: "Tarifa",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="text-right">S/ {value}</p>;
    },
  },
  {
    accessorKey: "includes_breakfast",
    header: "Desayuno",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <div className="flex justify-center">
          {value ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "includes_parking",
    header: "Estacionamiento",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <div className="flex justify-center">
          {value ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p>{value}</p>;
    },
  },
  {
    accessorKey: "address",
    header: "Dirección",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="max-w-xs truncate">{value}</p>;
    },
  },
  {
    accessorKey: "active",
    header: "Activo",
    cell: ({ row }) => {
      const { id, active } = row.original;
      return (
        <div className="flex justify-center">
          <Switch
            checked={active}
            onCheckedChange={() => onToggleActive(id)}
            disabled={!permissions.canUpdate}
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;

      return (
        <div className="flex items-center gap-2">
          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onUpdate(id)}
            >
              <Pencil className="size-5" />
            </Button>
          )}

          {/* Delete */}
          {permissions.canDelete && (
            <DeleteButton onClick={() => onDelete(id)} />
          )}
        </div>
      );
    },
  },
];
