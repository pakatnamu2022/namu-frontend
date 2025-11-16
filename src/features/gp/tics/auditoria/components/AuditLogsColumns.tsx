import type { ColumnDef } from "@tanstack/react-table";
import { AuditLogsResource } from "../lib/auditLogs.interface";

export type AuditLogsColumns = ColumnDef<AuditLogsResource>;

export const auditLogsColumns = (): AuditLogsColumns[] => [
  {
    accessorKey: "method",
    header: "Método",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "user_name",
    header: "Usuario",
  },
  {
    accessorKey: "auditable_type",
    header: "Tipo de Modelo",
  },
  {
    accessorKey: "model_name",
    header: "Nombre del Modelo",
  },
  {
    accessorKey: "action",
    header: "Acción",
  },
  {
    accessorKey: "action_description",
    header: "Descripción de la Acción",
  },
  {
    accessorKey: "ip_address",
    header: "Dirección IP",
  },
  {
    accessorKey: "old_values",
    header: "Valores Anteriores",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      if (!value) return <span className="text-muted-foreground">-</span>;

      try {
        // Si es un string JSON, lo parseamos para mostrarlo formateado
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        const formatted = JSON.stringify(parsed, null, 2);

        return (
          <pre className="text-xs max-w-md overflow-x-auto">
            <code>{formatted}</code>
          </pre>
        );
      } catch (error) {
        // Si no se puede parsear, mostramos el valor tal cual
        return <span className="text-xs">{value}</span>;
      }
    },
  },
  {
    accessorKey: "new_values",
    header: "Nuevos Valores",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      if (!value) return <span className="text-muted-foreground">-</span>;

      try {
        // Si es un string JSON, lo parseamos para mostrarlo formateado
        const parsed = typeof value === "string" ? JSON.parse(value) : value;
        const formatted = JSON.stringify(parsed, null, 2);

        return (
          <pre className="text-xs max-w-md overflow-x-auto">
            <code>{formatted}</code>
          </pre>
        );
      } catch (error) {
        // Si no se puede parsear, mostramos el valor tal cual
        return <span className="text-xs">{value}</span>;
      }
    },
  },
];
