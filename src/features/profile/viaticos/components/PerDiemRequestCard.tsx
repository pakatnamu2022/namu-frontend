import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  FileText,
  Wallet,
  Hotel,
  Clock,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface PerDiemRequest {
  id: number;
  code: string;
  start_date: string | Date;
  end_date: string | Date;
  status: string;
  district: {
    name: string;
  };
  purpose: string;
  total_budget: number;
  total_spent: number;
  has_hotel_reservation?: boolean;
}

interface PerDiemRequestCardProps {
  request: PerDiemRequest;
  onClick?: () => void;
}

const getStatusConfig = (status: string) => {
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
      icon: <Clock className="w-3 h-3" />,
    },
    approved: {
      label: "Aprobada",
      variant: "default",
      icon: <TrendingUp className="w-3 h-3" />,
    },
    rejected: {
      label: "Rechazada",
      variant: "destructive",
      icon: <TrendingUp className="w-3 h-3" />,
    },
    paid: {
      label: "Pagada",
      variant: "secondary",
      icon: <Wallet className="w-3 h-3" />,
    },
    pending_settlement: {
      label: "Pendiente de Liquidación",
      variant: "outline",
      icon: <Clock className="w-3 h-3" />,
    },
    in_progress: {
      label: "En Progreso",
      variant: "default",
      icon: <TrendingUp className="w-3 h-3" />,
    },
    cancelled: {
      label: "Cancelada",
      variant: "destructive",
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  return (
    statusConfig[status] || {
      label: status,
      variant: "outline" as const,
      icon: <Clock className="w-3 h-3" />,
    }
  );
};

export default function PerDiemRequestCard({
  request,
  onClick,
}: PerDiemRequestCardProps) {
  const statusConfig = getStatusConfig(request.status);

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group"
      onClick={onClick}
    >
      <CardHeader className="pb-3 space-y-2">
        {/* Código */}
        <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
          {request.code}
        </h3>

        {/* Fechas */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>
            {format(new Date(request.start_date), "dd MMM", {
              locale: es,
            })}{" "}
            -{" "}
            {format(new Date(request.end_date), "dd MMM, yyyy", {
              locale: es,
            })}
          </span>
        </div>

        {/* Badges de estado y hotel */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={statusConfig.variant}
            className="flex items-center gap-1"
          >
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </Badge>
          {request.has_hotel_reservation && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Hotel className="w-3 h-3" />
              <span className="text-xs">Hotel</span>
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Destino */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Destino</p>
            <p className="font-medium text-sm truncate">
              {request.district.name}
            </p>
          </div>
        </div>

        {/* Propósito */}
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Propósito</p>
            <p className="text-sm line-clamp-2">{request.purpose}</p>
          </div>
        </div>

        {/* Gastos */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Gastado</p>
          </div>
          <p className="font-semibold text-sm mt-1">
            S/ {request.total_spent.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
