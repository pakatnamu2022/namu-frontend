import type { ColumnDef } from "@tanstack/react-table";
import { ActiveSessionUser } from "../lib/activeSessions.interface";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/core/core.function";

export type ActiveSessionsColumns = ColumnDef<ActiveSessionUser>;

function formatActiveMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export const activeSessionsColumns = (): ActiveSessionsColumns[] => [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold">{row.original.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.original.username}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "cargo",
    header: "Cargo",
    cell: ({ getValue }) => (getValue() as string | null) ?? "-",
  },
  {
    accessorKey: "sede",
    header: "Sede",
    cell: ({ getValue }) => (getValue() as string | null) ?? "-",
  },
  {
    accessorKey: "empresa",
    header: "Empresa",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return value ? value.toUpperCase() : "-";
    },
  },
  {
    accessorKey: "login_at",
    header: "Inicio de Sesión",
    cell: ({ getValue }) => formatDateTime(getValue() as string | null),
  },
  {
    accessorKey: "last_seen_at",
    header: "Última Actividad",
    cell: ({ getValue }) => formatDateTime(getValue() as string | null),
  },
  {
    accessorKey: "active_minutes",
    header: "Tiempo Conectado",
    cell: ({ getValue }) => formatActiveMinutes(getValue() as number),
  },
  {
    accessorKey: "session_count",
    header: "Sesiones",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const status = getValue() as ActiveSessionUser["status"];
      return status === "online" ? (
        <Badge variant="outline" color="green">
          En línea
        </Badge>
      ) : (
        <Badge variant="outline" color="gray">
          Inactivo
        </Badge>
      );
    },
  },
];
