"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CM_POSTVENTA_ID, DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { deleteVehicle } from "@/features/ap/comercial/vehiculos/lib/vehicles.actions";
import VehicleActionsPV from "@/features/ap/comercial/vehiculos/components/VehicleActionsPV";
import { vehicleColumns } from "@/features/ap/comercial/vehiculos/components/VehicleColumns";
import VehicleTable from "@/features/ap/comercial/vehiculos/components/VehicleTable";
import VehicleOptions from "@/features/ap/comercial/vehiculos/components/VehicleOptions";
import { notFound } from "@/shared/hooks/useNotFound";
import { VEHICLES_PV } from "@/features/ap/comercial/vehiculos/lib/vehicles.constants";
import { useNavigate } from "react-router-dom";
import { useVehicles } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";

export default function VehiclesPostVentaPage() {
  const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = VEHICLES_PV;

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useVehicles({
    page,
    search,
    per_page,
    type_operation_id: CM_POSTVENTA_ID,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicle(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={"Gestión de vehículos"}
          icon={currentView.icon}
        />
        <VehicleActionsPV />
      </HeaderTableWrapper>
      <VehicleTable
        isLoading={isLoading}
        columns={vehicleColumns({
          onDelete: setDeleteId,
          onUpdate: (id) => router(`${VEHICLES_PV.ROUTE_UPDATE}/${id}`),
        })}
        data={data?.data || []}
      >
        <VehicleOptions search={search} setSearch={setSearch} />
      </VehicleTable>

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
