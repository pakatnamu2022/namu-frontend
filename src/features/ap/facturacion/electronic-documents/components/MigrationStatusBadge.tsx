import { Badge, BadgeColor } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ElectronicDocumentMigrationHistoryProps {
  migration_status: string;
}

export default function MigrationStatusBadge({
  migration_status,
}: ElectronicDocumentMigrationHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "in_progress":
        return CheckCircle2;
      case "completed":
        return CheckCircle2;
      case "failed":
        return XCircle;
      case "updated_with_nc":
        return CheckCircle2;
      default:
        return AlertCircle;
    }
  };

  const getNameStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_progress":
        return "En Proceso";
      case "completed":
        return "Completado";
      case "failed":
        return "Fallido";
      case "updated_with_nc":
        return "Actualizado con NC";
      default:
        return status;
    }
  };

  const variants: Record<string, BadgeColor> = {
    pending: "yellow",
    in_progress: "blue",
    completed: "green",
    failed: "red",
    updated_with_nc: "purple",
  };

  const variant = variants[migration_status] || "gray";
  const statusName = getNameStatus(migration_status);

  return (
    <Badge color={variant} icon={getStatusIcon(migration_status)} variant="outline">
      {statusName || migration_status}
    </Badge>
  );
}
