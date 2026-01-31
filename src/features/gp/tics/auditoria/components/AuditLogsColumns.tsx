import type { ColumnDef } from "@tanstack/react-table";
import { AuditLogsResource } from "../lib/auditLogs.interface";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Eye } from "lucide-react";

export type AuditLogsColumns = ColumnDef<AuditLogsResource>;

interface AuditLogsColumnsProps {
  onViewChanges: (audit: AuditLogsResource) => void;
}

export const auditLogsColumns = ({
  onViewChanges,
}: AuditLogsColumnsProps): AuditLogsColumns[] => [
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
    id: "actions",
    header: "Cambios",
    cell: ({ row }) => {
      const audit = row.original;
      const hasChanges = audit.old_values || audit.new_values;
      return (
        <ButtonAction
          icon={Eye}
          onClick={() => onViewChanges(audit)}
          canRender={!!hasChanges}
        />
      );
    },
  },
];
