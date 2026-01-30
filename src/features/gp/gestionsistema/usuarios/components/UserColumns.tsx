"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { UserResource } from "../lib/user.interface";
import { Building2, KeyRound, UserCog } from "lucide-react";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ButtonAction } from "@/shared/components/ButtonAction";

export type UserColumns = ColumnDef<UserResource>;

interface Props {
  onDelete: (id: number) => void;
  onManageSedes?: (user: UserResource) => void;
  onResetPassword?: (id: number) => void;
  onAssignRole: (user: UserResource) => void;
}

export const userColumns = ({
  onDelete,
  onManageSedes,
  onResetPassword,
  onAssignRole,
}: Props): UserColumns[] => [
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
          <Badge color="default" className="capitalize gap-2">
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
          <Badge color={"tertiary"} className="capitalize gap-2">
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
          <Badge color="tertiary" className="capitalize gap-2">
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
          {onManageSedes && (
            <ButtonAction
              icon={Building2}
              tooltip="Gestionar Sedes"
              onClick={() => onManageSedes(user)}
            />
          )}

          {onResetPassword && (
            <ButtonAction
              icon={KeyRound}
              tooltip="Restablecer Contraseña"
              onClick={() => onResetPassword(id)}
            />
          )}

          <ButtonAction
            icon={UserCog}
            tooltip="Asignar Rol"
            onClick={() => onAssignRole(user)}
          />

          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
