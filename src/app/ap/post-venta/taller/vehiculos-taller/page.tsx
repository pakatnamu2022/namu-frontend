"use client";

import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent.tsx";
import DataTablePagination from "@/shared/components/DataTablePagination.tsx";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog.tsx";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { DEFAULT_PER_PAGE } from "@/core/core.constants.ts";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper.tsx";
import { deleteVehicle } from "@/features/ap/comercial/vehiculos/lib/vehicles.actions.ts";
import VehicleActionsPV from "@/features/ap/comercial/vehiculos/components/VehicleActionsPV.tsx";
import { vehicleColumns } from "@/features/ap/comercial/vehiculos/components/VehicleColumns.tsx";
import VehicleTable from "@/features/ap/comercial/vehiculos/components/VehicleTable.tsx";
import VehicleOptions from "@/features/ap/comercial/vehiculos/components/VehicleOptions.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { VEHICLES_TLL } from "@/features/ap/comercial/vehiculos/lib/vehicles.constants.ts";
import { useNavigate } from "react-router-dom";
import { useVehicles } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook.ts";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

export default function VehiclesPostVentaPage() {
  const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE, ROUTE_UPDATE } = VEHICLES_TLL;

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
        <VehicleActionsPV module="TALLER" />
      </HeaderTableWrapper>
      <VehicleTable
        isLoading={isLoading}
        columns={vehicleColumns({
          onDelete: setDeleteId,
          onUpdate: (id) => router(`${ROUTE_UPDATE}/${id}`),
        })}
        data={data?.data || []}
        initialColumnVisibility={{ plate: true }}
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
