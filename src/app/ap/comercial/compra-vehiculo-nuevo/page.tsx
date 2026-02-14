"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { CM_COMERCIAL_ID, DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { VEHICLE_PURCHASE_ORDER } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import { useVehiclePurchaseOrder } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.hook";
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
  const { ROUTE } = VEHICLE_PURCHASE_ORDER;

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

  const handleRequestCreditNote = (purchaseOrderId: number) => {
    // Aquí puedes implementar la lógica para solicitar la nota de crédito
    console.log(
      "Solicitar nota de crédito para la orden de compra ID:",
      purchaseOrderId,
    );
  };

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
    type_operation_id: CM_COMERCIAL_ID,
  });

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
          onRequestCreditNote: handleRequestCreditNote,
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
