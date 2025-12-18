"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { EXHIBITION_VEHICLES } from "@/features/ap/comercial/vehiculos-exhibicion/lib/exhibitionVehicles.constants";
import {
  useDeleteExhibitionVehicles,
  useExhibitionVehicles,
} from "@/features/ap/comercial/vehiculos-exhibicion/lib/exhibitionVehicles.hook";
import ExhibitionVehiclesTable from "@/features/ap/comercial/vehiculos-exhibicion/components/ExhibitionVehiclesTable";
import { exhibitionVehiclesColumns } from "@/features/ap/comercial/vehiculos-exhibicion/components/ExhibitionVehiclesColumns";
import ExhibitionVehiclesActions from "@/features/ap/comercial/vehiculos-exhibicion/components/ExhibitionVehiclesActions";
import ExhibitionVehiclesOptions from "@/features/ap/comercial/vehiculos-exhibicion/components/ExhibitionVehiclesOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function ExhibitionVehiclesPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filtros
  const [advisorId, setAdvisorId] = useState<string>("all");
  const [vehicleStatusIds, setVehicleStatusIds] = useState<string[]>([]);
  const [propietarioId, setPropietarioId] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [ubicacionId, setUbicacionId] = useState<string>("all");

  const { MODEL, ROUTE } = EXHIBITION_VEHICLES;
  const deleteMutation = useDeleteExhibitionVehicles();
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, advisorId, vehicleStatusIds, propietarioId, status, ubicacionId]);

  const { data, isLoading, refetch } = useExhibitionVehicles({
    page,
    search,
    per_page,
    advisor_id: advisorId !== "all" ? Number(advisorId) : undefined,
    ap_vehicle_status_id: vehicleStatusIds.map(id => Number(id)),
    propietario_id: propietarioId !== "all" ? Number(propietarioId) : undefined,
    status: status !== "all" ? status === "1" : undefined,
    ubicacion_id: ubicacionId !== "all" ? Number(ubicacionId) : undefined,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        refetch();
        successToast(SUCCESS_MESSAGE(MODEL, "delete"));
        setDeleteId(null);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "";
        errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
        setDeleteId(null);
      },
    });
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <ExhibitionVehiclesActions permissions={permissions} />
      </HeaderTableWrapper>

      <ExhibitionVehiclesTable
        isLoading={isLoading}
        columns={exhibitionVehiclesColumns({
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ExhibitionVehiclesOptions
          search={search}
          setSearch={setSearch}
          advisorId={advisorId}
          setAdvisorId={setAdvisorId}
          vehicleStatusIds={vehicleStatusIds}
          setVehicleStatusIds={setVehicleStatusIds}
          propietarioId={propietarioId}
          setPropietarioId={setPropietarioId}
          status={status}
          setStatus={setStatus}
          ubicacionId={ubicacionId}
          setUbicacionId={setUbicacionId}
        />
      </ExhibitionVehiclesTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
