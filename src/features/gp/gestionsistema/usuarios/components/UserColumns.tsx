"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UserResource } from "../lib/user.interface";
import { Button } from "@/components/ui/button";
import { Building2, KeyRound } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type UserColumns = ColumnDef<UserResource>;

export const userColumns = ({
  onDelete,
  onManageSedes,
  onResetPassword,
}: {
  onDelete: (id: number) => void;
  onManageSedes?: (user: UserResource) => void;
  onResetPassword?: (id: number) => void;
}): UserColumns[] => [
  {
    id: "userInfo",
    header: "Usuario",
    accessorFn: (row) => row, // accedes a toda la fila
    cell: ({ getValue }) => {
      const user = getValue() as UserResource;

      return (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage
              className="object-cover object-top"
              src={user.foto_adjunto}
              alt={user.name}
            />
            <AvatarFallback>{user.name?.[0] ?? "-"}</AvatarFallback>
          </Avatar>
          <p className="font-semibold">{user.name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "username",
    header: "Usuario",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="outline" className="capitalize gap-2">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="default" className="capitalize gap-2">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "position",
    header: "Cargo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant={"tertiary"} className="capitalize gap-2">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "empresa",
    header: "Empresa",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="outline" className="capitalize gap-2">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    accessorKey: "sede",
    header: "Sede",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        value && (
          <Badge variant="tertiary" className="capitalize gap-2">
            {value}
          </Badge>
        )
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      // const router = useNavigate();
      const id = row.original.id;
      const user = row.original;
      // const { ROUTE_UPDATE } = USER;

      return (
        <div className="flex items-center gap-2">
          {/* Gestionar Sedes */}
          {onManageSedes && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onManageSedes(user)}
              tooltip="Gestionar Sedes"
            >
              <Building2 className="size-5" />
            </Button>
          )}

          {/* Restablecer Contraseña */}
          {onResetPassword && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onResetPassword(id)}
              tooltip="Restablecer Contraseña"
            >
              <KeyRound className="size-5" />
            </Button>
          )}

          {/* Rol */}
          {/* <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            tooltip="Gestionar Rol"
          >
            <UserRoundCog className="size-5" />
          </Button> */}

          {/* Edit */}
          {/* <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
            tooltip="Editar Usuario"
          >
            <Pencil className="size-5" />
          </Button> */}
          {/* Delete */}
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
