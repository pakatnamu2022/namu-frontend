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

export default function MyPerDiemPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, "my-requests"],
    queryFn: () => getMyPerDiemRequests({}),
  });

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.data?.map((request) => (
              <PerDiemRequestCard
                key={request.id}
                request={request}
                onClick={() => navigate(`/perfil/viaticos/${request.id}`)}
              />
            ))}
          </div>
        )}

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
