"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useCallback, useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import TravelControlTable from "@/features/tp/comercial/ControlViajes/components/TravelControlTable";
import { TravelControlColumns } from "@/features/tp/comercial/ControlViajes/components/TravelControlColumns";
import { TripStatus } from "@/features/tp/comercial/ControlViajes/lib/travelControl.interface";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useTravels } from "@/features/tp/comercial/ControlViajes/lib/travelControl.hooks";
import TravelControlOptions from "@/features/tp/comercial/ControlViajes/components/TravelControlOptions";
import { TRAVEL_CONTROL } from "@/features/tp/comercial/ControlViajes/controlViajesType/travelControl.constants";

export default function ControlTravelPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TripStatus | "all">("all");
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);
  const { ROUTE } = TRAVEL_CONTROL;

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  useEffect(() => {
    resetPage();
  }, [search, per_page, resetPage]);

  const { data, isLoading } = useTravels({
    page,
    search,
    status,
    per_page,
  });

  const handleSearchOrStatusChange = useCallback(() => {
    if (search !== "" || status !== "all") {
      setPage(1);
    }
  }, [search, status]);

  useEffect(() => {
    handleSearchOrStatusChange();
  }, [handleSearchOrStatusChange]);

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={`${currentView.descripcion || "Control de Viajes"}`}
          subtitle={
            userComplete?.role?.toUpperCase() === "COMERCIAL Y FACTURACION TP"
              ? "Gestión de Combustible"
              : "Mis Viajes"
          }
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <TravelControlTable
        isLoading={isLoading}
        columns={TravelControlColumns({})}
        data={data?.data || []}
      >
        <TravelControlOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          userPosition={userComplete?.role?.toUpperCase()}
        />
      </TravelControlTable>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
