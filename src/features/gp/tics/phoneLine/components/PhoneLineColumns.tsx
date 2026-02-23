"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PhoneLineResource } from "../lib/phoneLine.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, History, Pencil, UserPlus, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DeleteButton } from "@/shared/components/SimpleDeleteDialog";
import { PHONE_LINE } from "../lib/phoneLine.constants";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export type PhoneLineColumns = ColumnDef<PhoneLineResource>;

export const phoneLineColumns = ({
  onDelete,
  onToggleStatus,
  onAssign,
  onHistory,
}: {
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: boolean) => void;
  onAssign: (id: number) => void;
  onHistory: (id: number) => void;
}): PhoneLineColumns[] => [
  {
    accessorKey: "line_number",
    header: "Número",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "telephone_account.account_number",
    header: "Número de cuenta",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "telephone_plan.name",
    header: "Plan telefónico",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "company",
    header: "Empresa",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "telephone_account.operator",
    header: "Operador",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "active_assignment.worker_name",
    header: "Asignado a",
    cell: ({ getValue }) => (
      <span className="font-semibold">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "active_assignment.assigned_at",
    header: "Asignado el",
    cell: ({ getValue }) =>
      getValue() && (
        <span className="font-semibold">
          {new Date(getValue() as string).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </span>
      ),
  },
  {
    accessorKey: "is_active_label",
    header: "Activo",
    cell: ({ row }) => {
      const value = row.original.is_active as boolean | number;
      const isActive = value === 1 || value === true;
      return (
        <Badge
          icon={isActive ? CheckCircle : XCircle}
          color={isActive ? "green" : "red"}
          variant="outline"
          className="capitalize gap-2"
        >
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: "Activo",
    enableSorting: true,
    cell: ({ row }) => {
      const [is_active, setIsActive] = useState(row.original.is_active);
      return (
        <Switch
          className="hover:cursor-pointer"
          checked={is_active}
          onCheckedChange={(checked) => {
            setIsActive(checked);
            onToggleStatus(row.original.id, checked);
          }}
        />
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
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onAssign(id)}
          >
            <UserPlus className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => onHistory(id)}
          >
            <History className="size-5" />
          </Button>
          <DeleteButton onClick={() => onDelete(id)} />
        </div>
      );
    },
  },
];
