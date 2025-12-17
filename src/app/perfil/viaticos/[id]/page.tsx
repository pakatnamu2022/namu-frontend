import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { findPerDiemRequestById } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/lib/perDiemRequest.constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Target,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import ExpensesTable from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/components/ExpensesTable";
import PerDiemRequestActions from "@/features/gp/gestionhumana/viaticos/solicitud-viaticos/components/PerDiemRequestActions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PerDiemRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: request, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  const getStatusBadge = (status: string) => {
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
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "outline",
      icon: null,
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Solicitud no encontrada</p>
          <Button onClick={() => navigate("/perfil/viaticos")} className="mt-4">
            Volver a Mis Viáticos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/perfil/viaticos")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{request.code}</h1>
            <p className="text-muted-foreground">
              Detalle de Solicitud de Viáticos
            </p>
          </div>
        </div>
        {getStatusBadge(request.status)}
      </div>

      {/* Status and Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información General</CardTitle>
          <CardDescription>Detalles de la solicitud</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Fechas</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(request.start_date), "dd 'de' MMMM, yyyy", {
                  locale: es,
                })}{" "}
                -{" "}
                {format(new Date(request.end_date), "dd 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {request.days_count} {request.days_count === 1 ? "día" : "días"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Destino</p>
              <p className="text-sm text-muted-foreground">
                {request.destination}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Propósito</p>
              <p className="text-sm text-muted-foreground">{request.purpose}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Categoría</p>
              <p className="text-sm text-muted-foreground">
                {request.category.name}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
          <CardDescription>Montos y saldos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Presupuesto Total</p>
              <p className="text-2xl font-bold">
                S/ {request.total_budget.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Gastado</p>
              <p className="text-2xl font-bold text-orange-600">
                S/ {request.total_spent.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Por Devolver</p>
              <p className="text-2xl font-bold text-green-600">
                S/ {request.balance_to_return.toFixed(2)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Método de Pago</p>
              <div className="space-y-1">
                <p className="text-sm">
                  Efectivo:{" "}
                  <span className="font-semibold">
                    S/ {request.cash_amount.toFixed(2)}
                  </span>
                </p>
                <p className="text-sm">
                  Transferencia:{" "}
                  <span className="font-semibold">
                    S/ {request.transfer_amount.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gastos Registrados</CardTitle>
              <CardDescription>
                Lista de todos los gastos de esta solicitud
              </CardDescription>
            </div>
            <PerDiemRequestActions requestId={request.id} />
          </div>
        </CardHeader>
        <CardContent>
          <ExpensesTable expenses={request.expenses || []} />
        </CardContent>
      </Card>
    </div>
  );
}
