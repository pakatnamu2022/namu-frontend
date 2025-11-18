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
import { VEHICLE_PURCHASE_ORDER } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import { useVehiclePurchaseOrder } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.hook";
import { deleteVehiclePurchaseOrder } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.actions";
import VehiclePurchaseOrderActions from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderActions";
import { vehiclePurchaseOrderColumns } from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderColumns";
import VehiclePurchaseOrderTable from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderTable";
import VehiclePurchaseOrderOptions from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderOptions";
import { notFound } from "@/shared/hooks/useNotFound";


export default function VehiclePurchaseOrderPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [sedeId, setSedeId] = useState("all");
  const [warehouseId, setWarehouseId] = useState("all");
  const [supplierId, setSupplierId] = useState("all");
  const [year, setYear] = useState("all");
  const [modelId, setModelId] = useState("all");
  const [colorId, setColorId] = useState("all");
  const [statusId, setStatusId] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { MODEL, ROUTE } = VEHICLE_PURCHASE_ORDER;

  useEffect(() => {
    setPage(1);
  }, [
    search,
    per_page,
    sedeId,
    warehouseId,
    supplierId,
    year,
    modelId,
    colorId,
    statusId,
  ]);

  const { data, isLoading, isFetching, refetch } = useVehiclePurchaseOrder({
    page,
    search,
    per_page,
    sede_id: sedeId !== "all" ? sedeId : undefined,
    warehouse_id: warehouseId !== "all" ? warehouseId : undefined,
    supplier_id: supplierId !== "all" ? supplierId : undefined,
    year: year !== "all" ? year : undefined,
    vehicle$ap_models_vn_id: modelId !== "all" ? modelId : undefined,
    vehicle_color_id: colorId !== "all" ? colorId : undefined,
    vehicle$ap_vehicle_status_id: statusId !== "all" ? statusId : undefined,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehiclePurchaseOrder(deleteId);
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
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <VehiclePurchaseOrderActions
          isFetching={isFetching && !isLoading}
          onRefresh={refetch}
        />
      </HeaderTableWrapper>
      <VehiclePurchaseOrderTable
        isLoading={isLoading}
        columns={vehiclePurchaseOrderColumns({
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <VehiclePurchaseOrderOptions
          search={search}
          setSearch={setSearch}
          sedeId={sedeId}
          setSedeId={setSedeId}
          warehouseId={warehouseId}
          setWarehouseId={setWarehouseId}
          supplierId={supplierId}
          setSupplierId={setSupplierId}
          year={year}
          setYear={setYear}
          modelId={modelId}
          setModelId={setModelId}
          colorId={colorId}
          setColorId={setColorId}
          statusId={statusId}
          setStatusId={setStatusId}
        />
      </VehiclePurchaseOrderTable>

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
