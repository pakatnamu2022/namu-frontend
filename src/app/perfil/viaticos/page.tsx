"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPerDiemRequests } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
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
import { useNavigate } from "react-router-dom";
import PerDiemRequestActions from "@/features/profile/viaticos/components/PerDiemRequestActions";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";

export default function MyPerDiemPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, "my-requests"],
    queryFn: () => getMyPerDiemRequests({}),
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      pending: { label: "Pendiente", variant: "outline" },
      approved: { label: "Aprobada", variant: "default" },
      rejected: { label: "Rechazada", variant: "destructive" },
      paid: { label: "Pagada", variant: "secondary" },
      pending_settlement: {
        label: "Pendiente de Liquidación",
        variant: "outline",
      },
      in_progress: { label: "En Progreso", variant: "default" },
    };

    const config = statusConfig[status] || {
      label: status,
      variant: "outline",
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <HeaderTableWrapper>
            <TitleComponent
              title="Mis Viáticos"
              subtitle="Gestiona tus solicitudes de viáticos y gastos"
              icon="Receipt"
            >
              <PerDiemRequestActions
                permissions={{ canCreate: true, canApprove: true }}
              />
            </TitleComponent>
          </HeaderTableWrapper>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        <HeaderTableWrapper>
          <TitleComponent
            title="Mis Viáticos"
            subtitle="Gestiona tus solicitudes de viáticos y gastos"
            icon="Receipt"
          />

          <PerDiemRequestActions
            permissions={{ canCreate: true, canApprove: true }}
          />
        </HeaderTableWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data?.map((request) => (
            <Card
              key={request.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/perfil/viaticos/${request.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{request.code}</CardTitle>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  {format(new Date(request.start_date), "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}{" "}
                  -{" "}
                  {format(new Date(request.end_date), "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Destino</p>
                  <p className="font-medium">{request.district.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Propósito</p>
                  <p className="text-sm line-clamp-2">{request.purpose}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Presupuesto</p>
                    <p className="font-semibold text-sm">
                      S/ {request.total_budget.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Gastado</p>
                    <p className="font-semibold text-sm">
                      S/ {request.total_spent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {data?.data?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No tienes solicitudes de viáticos
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
