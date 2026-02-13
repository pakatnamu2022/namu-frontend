"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyPerDiemRequests } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { useNavigate } from "react-router-dom";
import PerDiemRequestActions from "@/features/profile/viaticos/components/PerDiemRequestActions";
import PerDiemRequestCard from "@/features/profile/viaticos/components/PerDiemRequestCard";
import PageWrapper from "@/shared/components/PageWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useMemo } from "react";

export default function MyPerDiemPage() {
  const navigate = useNavigate();

  const { ABSOLUTE_ROUTE: PER_DIEM_REQUEST_ROUTE, QUERY_KEY } =
    PER_DIEM_REQUEST;
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEY, "my-requests"],
    queryFn: () => getMyPerDiemRequests({}),
  });

<<<<<<< Updated upstream
=======
  // Agrupar solicitudes por estado
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const groupedRequests = useMemo(() => {
    if (!data?.data) return { active: [], completed: [] };

    const active: typeof data.data = [];
    const completed: typeof data.data = [];

    data.data.forEach((request) => {
      // Estados activos: aquellos que requieren acción o están en proceso
      if (
        request.status === "pending" ||
        request.status === "approved" ||
        request.status === "in_progress" ||
        request.status === "pending_settlement"
      ) {
        active.push(request);
      }
      // Estados completados: aquellos que ya finalizaron
      else if (
        request.status === "settled" ||
        request.status === "rejected" ||
        request.status === "cancelled"
      ) {
        completed.push(request);
      }
    });

    return { active, completed };
  }, [data]);

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

        {isLoading ? (
          <FormSkeleton />
        ) : (
          <div className="space-y-8">
            {/* Sección de Activos */}
            {groupedRequests.active.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    En Proceso
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {groupedRequests.active.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedRequests.active.map((request) => (
                    <PerDiemRequestCard
                      key={request.id}
                      request={request}
                      onClick={() =>
                        navigate(`${PER_DIEM_REQUEST_ROUTE}/${request.id}`)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sección de Completados */}
            {groupedRequests.completed.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Completados
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {groupedRequests.completed.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedRequests.completed.map((request) => (
                    <PerDiemRequestCard
                      key={request.id}
                      request={request}
                      onClick={() =>
                        navigate(`${PER_DIEM_REQUEST_ROUTE}/${request.id}`)
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay datos */}
            {data?.data?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No tienes solicitudes de viáticos
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
