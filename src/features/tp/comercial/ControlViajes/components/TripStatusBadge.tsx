import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Fuel, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripStatusBadgeProps {
  status: "pending" | "in_progress" | "completed" | "fuel_pending";
}

export function TripStatusBadge({ status }: TripStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="size-3" />,
          label: "Pendiente",
          className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        };
      case "in_progress":
        return {
          icon: <Play className="size-3" />,
          label: "En Ruta",
          className: "bg-green-50 border-green-200 text-green-800",
        };
      case "completed":
        return {
          icon: <CheckCircle className="size-3" />,
          label: "Completado",
          className: "bg-blue-50 border-blue-200 text-blue-800",
        };
      case "fuel_pending":
        return {
          icon: <Fuel className="size-3" />,
          label: "Combustible Pendiente",
          className: "bg-orange-50 border-orange-200 text-orange-800",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant="outline" className={cn("capitalize gap-2", config.className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
