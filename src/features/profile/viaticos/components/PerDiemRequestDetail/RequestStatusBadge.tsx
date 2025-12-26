import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface RequestStatusBadgeProps {
  status: string;
}

export default function RequestStatusBadge({
  status,
}: RequestStatusBadgeProps) {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: React.ReactNode;
    }
  > = {
    pending: {
      label: "Pendiente",
      variant: "outline",
      icon: <Clock className="h-3 w-3" />,
    },
    approved: {
      label: "Aprobada",
      variant: "default",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    rejected: {
      label: "Rechazada",
      variant: "destructive",
      icon: <XCircle className="h-3 w-3" />,
    },
    paid: {
      label: "Pagada",
      variant: "secondary",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    pending_settlement: {
      label: "Pendiente de Liquidación",
      variant: "outline",
      icon: <Clock className="h-3 w-3" />,
    },
    in_progress: {
      label: "En Progreso",
      variant: "default",
      icon: <Clock className="h-3 w-3" />,
    },
  };

  const config = statusConfig[status] || {
    label: status,
    variant: "outline" as const,
    icon: null,
  };

  return (
    <Badge
      variant={config.variant}
      className="flex! items-center gap-1 w-fit"
    >
      {config.icon}
      <p className="line-clamp-1">{config.label}</p>
    </Badge>
  );
}
