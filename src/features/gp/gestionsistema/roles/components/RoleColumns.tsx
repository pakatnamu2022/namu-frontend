"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { RoleResource } from "../lib/role.interface";
import { Button } from "@/components/ui/button";
import { Copy, KeyRound, Pencil, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { RoleUsersModal } from "./RoleUsersModal";
import { ROLE } from "../lib/role.constants";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { useDuplicateRole } from "../lib/role.hook";

export type RoleColumns = ColumnDef<RoleResource>;

interface Props {
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
}

export const roleColumns = ({ onUpdate, onDelete }: Props): RoleColumns[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="uppercase">{value}</p>;
    },
  },
  {
    accessorKey: "users",
    header: "Usuarios",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return <Badge className="text-xs">{value}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { mutate: duplicate } = useDuplicateRole();
      const id = row.original.id;
      const { ABSOLUTE_ROUTE } = ROLE;

      return (
        <div className="flex items-center gap-2">
          {/* Users */}
          <RoleUsersModal
            id={id}
            nombre={row.original.nombre}
            trigger={
              <Button
                tooltip="Usuarios"
                variant="outline"
                size="sm"
                className="h-7 text-xs!"
              >
                <UsersRound className="size-5" />
                Asignados
              </Button>
            }
          />
          {/* Accesss */}
          <Button
            tooltip="Permisos"
            variant="outline"
            size="sm"
            className="h-7 text-xs!"
            onClick={() =>
              router(
                `${ABSOLUTE_ROUTE}/permisos/${id}?nombre=${encodeURIComponent(
                  row.original.nombre,
                )}`,
              )
            }
          >
            <KeyRound className="size-5" />
            Permisos
          </Button>

          {/* Duplicate */}
          <ConfirmationDialog
            trigger={
              <Button
                tooltip="Duplicar"
                variant="outline"
                size="icon"
                className="size-7"
              >
                <Copy className="size-5" />
              </Button>
            }
            title="¿Duplicar rol?"
            description={`Se creará una copia del rol "${row.original.nombre}". ¿Deseas continuar?`}
            confirmText="Sí, duplicar"
            cancelText="Cancelar"
            icon="info"
            onConfirm={() => duplicate(id)}
          />

          {/* Edit */}
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onUpdate(id)}
          >
            <Pencil className="size-5" />
          </Button>

          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
