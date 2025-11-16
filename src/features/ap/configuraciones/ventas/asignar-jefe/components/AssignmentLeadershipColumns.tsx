import type { ColumnDef } from "@tanstack/react-table";
import {
  AsesorResource,
  AssignmentLeadershipResource,
} from "../lib/assignmentLeadership.interface";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ASSIGNMENT_LEADERSHIP } from "../lib/assignmentLeadership.constants";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type AssignmentLeadershipColumns =
  ColumnDef<AssignmentLeadershipResource>;

interface Props {
  onToggleStatus: (
    id: number,
    newStatus: boolean,
    year: number,
    month: number
  ) => void;
  permissions: {
    canUpdate: boolean;
  };
}

export const assignmentLeadershipColumns = ({
  onToggleStatus,
  permissions,
}: Props): AssignmentLeadershipColumns[] => [
  {
    accessorKey: "period",
    header: "Periodo",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "boss_name",
    header: "Nombre",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "boss_position",
    header: "Cargo",
    cell: ({ getValue }) => {
      const value = (getValue() as string) || "";
      if (value.includes("JEFE"))
        return (
          <span className="text-primary font-semibold">JEFE DE VENTAS</span>
        );
      if (value.includes("GERENTE"))
        return (
          <span className="text-destructive font-semibold">
            GERENTE COMERCIAL
          </span>
        );
      return <span>{value}</span>;
    },
  },
  {
    accessorKey: "assigned_workers",
    header: "Asesores",
    cell: ({ getValue }) => {
      const asesores = getValue() as AsesorResource[];
      if (!asesores || asesores.length === 0) {
        return <span className="text-gray-400 italic">Sin asesores</span>;
      }

      return (
        <div className="flex flex-wrap gap-1">
          {asesores.map((asesor) => (
            <span
              key={asesor.id}
              className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
            >
              {asesor.name}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      return (
        <Badge
          variant={value ? "default" : "secondary"}
          className="capitalize w-20 flex items-center justify-center"
        >
          {value ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const { boss_id, year, month, status } = row.original;
      const { ROUTE_UPDATE } = ASSIGNMENT_LEADERSHIP;

      return (
        <div className="flex items-center justify-center gap-2">
          {/* Toggle Status */}
          {permissions.canUpdate && (
            <Switch
              checked={status}
              thumbClassName="size-4"
              onCheckedChange={(checked) =>
                onToggleStatus(boss_id, checked, year, month)
              }
              className={cn("h-5 w-9", status ? "bg-primary" : "bg-secondary")}
            />
          )}

          {/* Edit */}
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router(`${ROUTE_UPDATE}/${boss_id}`)}
              disabled={!status}
            >
              <Pencil className="size-5" />
            </Button>
          )}
        </div>
      );
    },
  },
];
