"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { useVehiclePurchaseOrder } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.hook";
import { vehiclePurchaseOrderColumns } from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderColumns";
import VehiclePurchaseOrderTable from "@/features/ap/comercial/ordenes-compra-vehiculo/components/VehiclePurchaseOrderTable";
import { notFound } from "@/shared/hooks/useNotFound";
import { PURCHASE_INVOICE_PV } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import PurchaseOrderWarehouseActions from "@/features/ap/post-venta/gestion-almacen/factura-compra/components/PurchaseOrderWarehouseActions";
import PurchaseOrderWarehouseOptions from "@/features/ap/post-venta/gestion-almacen/factura-compra/components/PurchaseOrderWarehouseOptions";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import {
  dispatchSyncCreditNote,
  dispatchSyncInvoice,
} from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.actions";

export default function PurchaseOrderWarehousePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [sedeId, setSedeId] = useState<string>("");
  const { ROUTE, MODEL } = PURCHASE_INVOICE_PV;

  const { data, isLoading, isFetching, refetch } = useVehiclePurchaseOrder({
    page,
    search,
    per_page,
    sede_id: sedeId !== "all" ? sedeId : undefined,
    type_operation_id: CM_POSTVENTA_ID,
  });

  const { data: sedes = [] } = useMySedes({ company: EMPRESA_AP.id });

  // Setear el primer almacén por defecto
  useEffect(() => {
    if (sedes.length > 0 && !sedeId) {
      setSedeId(sedes[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedes]);

  const handleRequestInvoice = async (purchaseOrderId: number) => {
    await dispatchSyncInvoice(purchaseOrderId)
      .then((response) => {
        if (response.message) {
          successToast(response.message);
        }
        refetch();
      })
      .catch((error: any) => {
        const errorMsg =
          error.response?.data?.message || ERROR_MESSAGE(MODEL, "fetch");
        errorToast(errorMsg);
      });
  };

  const handleRequestCreditNote = async (purchaseOrderId: number) => {
    await dispatchSyncCreditNote(purchaseOrderId)
      .then((response) => {
        if (response.message) {
          successToast(response.message);
        }
        refetch();
      })
      .catch((error: any) => {
        const errorMsg =
          error.response?.data?.message || ERROR_MESSAGE(MODEL, "fetch");
        errorToast(errorMsg);
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
        <PurchaseOrderWarehouseActions
          isFetching={isFetching && !isLoading}
          onRefresh={refetch}
        />
      </HeaderTableWrapper>
      <VehiclePurchaseOrderTable
        isLoading={isLoading}
        columns={vehiclePurchaseOrderColumns({
          onRequestInvoice: handleRequestInvoice,
          onRequestCreditNote: handleRequestCreditNote,
        })}
        data={data?.data || []}
      >
        <PurchaseOrderWarehouseOptions
          search={search}
          setSearch={setSearch}
          sedes={sedes}
          sedeId={sedeId}
          setSedeId={setSedeId}
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
