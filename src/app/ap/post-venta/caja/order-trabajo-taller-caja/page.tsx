"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import type { RowSelectionState } from "@tanstack/react-table";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import {
  errorToast,
  getCurrentDayOfMonth,
  getFirstDayOfMonth,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE, EMPRESA_AP } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { WORKER_ORDER_CAJA } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import {
  useGetWorkOrder,
  useGetWorkOrderWithInternalNotes,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.hook";
import WorkOrderTable from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderTable";
import WorkOrderOptions from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate } from "react-router-dom";
import { workOrderCajaColumns } from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderCajaColumns";
import WorkOrderActionsFilters, {
  WorkOrderCajaView,
} from "@/features/ap/post-venta/taller/orden-trabajo/components/WorkOrderActionsFilters";
import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";
import { useMySedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllTypesPlanning } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { OT_UNBILLED_IDS } from "@/features/ap/configuraciones/postventa/tipos-planificacion/lib/typesPlanning.constants";

export default function WorkOrderCajaPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [activeView, setActiveView] = useState<WorkOrderCajaView>("OT");
  const [page, setPage] = useState(1);
  const [sedeId, setSedeId] = useState<string>("");
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [typePlanningId, setTypePlanningId] = useState<string>("");
  const [typeCurrencyId, setTypeCurrencyId] = useState<string>("");
  const { ROUTE, ABSOLUTE_ROUTE } = WORKER_ORDER_CAJA;
  const permissions = useModulePermissions(ROUTE);
  const router = useNavigate();
  const currentDate = new Date();

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    getFirstDayOfMonth(currentDate),
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    getCurrentDayOfMonth(currentDate),
  );

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined;
  };

  const { data: mySedes = [], isLoading: isLoadingSedes } = useMySedes({
    company: EMPRESA_AP.id,
    has_workshop: true,
  });

  const { data: allTypesPlanning = [], isLoading: isLoadingTypesPlanning } =
    useAllTypesPlanning();

  const { data: allTypesCurrency = [], isLoading: isLoadingTypesCurrency } =
    useAllCurrencyTypes();

  const isBillingView = activeView === "PENDING" || activeView === "INVOICED";

  const billingTypesPlanning = allTypesPlanning.filter(
    (t) => t.type_document === "INTERNA" && !OT_UNBILLED_IDS.includes(t.id),
  );

  // Valor efectivo: en vistas de facturación usa el seleccionado o el primero disponible;
  // en otras vistas no aplica el filtro.
  const effectiveTypePlanningId = isBillingView
    ? typePlanningId || (billingTypesPlanning[0]?.id.toString() ?? "")
    : "";

  const effectiveSedeId =
    sedeId || (mySedes.length > 0 ? mySedes[0].id.toString() : "");

  const efecctiveTypeCurrencyId =
    typeCurrencyId || (allTypesCurrency[0]?.id.toString() ?? "");

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    if (date && dateTo && date > dateTo) {
      setDateTo(date);
      errorToast("La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'.");
    }
  };

  const handleViewChange = (view: WorkOrderCajaView) => {
    setActiveView(view);
    setPage(1);
    setRowSelection({});
    setTypePlanningId("");
  };

  const commonParams = {
    page,
    search,
    per_page,
    opening_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
    sede_id: effectiveSedeId || undefined,
    currency_id: efecctiveTypeCurrencyId || undefined,
  };

  const { data: dataOT, isLoading: isLoadingOT } = useGetWorkOrder({
    params: {
      page,
      search,
      per_page,
      opening_date:
        dateFrom && dateTo
          ? [formatDate(dateFrom), formatDate(dateTo)]
          : undefined,
      sede_id: effectiveSedeId || undefined,
      currency_id: efecctiveTypeCurrencyId || undefined,
      items$typePlanning$type_document: "PAYMENT_RECEIPTS",
      items$typePlanning$id: typePlanningId || undefined,
    },
    enabled: activeView === "OT" && !!effectiveSedeId,
  });

  const { data: dataPending, isLoading: isLoadingPending } =
    useGetWorkOrderWithInternalNotes({
      params: {
        ...commonParams,
        internal_note_status: "pending",
        items$typePlanning$id: effectiveTypePlanningId || undefined,
      },
      enabled: activeView === "PENDING" && !!effectiveTypePlanningId,
    });

  const { data: dataInvoiced, isLoading: isLoadingInvoiced } =
    useGetWorkOrderWithInternalNotes({
      params: {
        ...commonParams,
        internal_note_status: "invoiced",
        items$typePlanning$id: effectiveTypePlanningId || undefined,
      },
      enabled: activeView === "INVOICED" && !!effectiveTypePlanningId,
    });

  const currentData =
    activeView === "OT"
      ? dataOT
      : activeView === "PENDING"
        ? dataPending
        : dataInvoiced;

  const currentIsLoading =
    activeView === "OT"
      ? isLoadingOT
      : activeView === "PENDING"
        ? isLoadingPending
        : isLoadingInvoiced;

  const handleBill = (id: number) => {
    router(`${ABSOLUTE_ROUTE}/facturar/${id}`);
  };

  const selectedIds = Object.keys(rowSelection).filter(
    (key) => rowSelection[key],
  );

  const handleGenerateInvoice = () => {
    if (selectedIds.length === 0) return;
    router(`${ABSOLUTE_ROUTE}/factura-directa?ids=${selectedIds.join(",")}`);
  };

  if (
    isLoadingModule ||
    isLoadingSedes ||
    isLoadingTypesPlanning ||
    isLoadingTypesCurrency
  )
    return <PageSkeleton />;
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
        <WorkOrderActionsFilters
          activeView={activeView}
          onViewChange={handleViewChange}
        />
      </HeaderTableWrapper>

      {activeView === "PENDING" && selectedIds.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleGenerateInvoice} className="gap-2">
            <Receipt className="h-4 w-4" />
            Generar Factura ({selectedIds.length})
          </Button>
        </div>
      )}

      <WorkOrderTable
        isLoading={currentIsLoading}
        columns={workOrderCajaColumns({
          onBill: handleBill,
          permissions,
          showCheckbox: activeView === "PENDING",
          showActions: activeView === "OT",
        })}
        data={currentData?.data || []}
        enableRowSelection={activeView === "PENDING"}
        rowSelection={activeView === "PENDING" ? rowSelection : undefined}
        onRowSelectionChange={
          activeView === "PENDING" ? setRowSelection : undefined
        }
        getRowId={(row) => String(row.id)}
      >
        <WorkOrderOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={handleDateFromChange}
          dateTo={dateTo}
          setDateTo={setDateTo}
          sedes={mySedes}
          sedeId={effectiveSedeId}
          setSedeId={setSedeId}
          typesPlanning={
            isBillingView ? billingTypesPlanning : allTypesPlanning
          }
          typePlanningId={
            isBillingView ? effectiveTypePlanningId : typePlanningId
          }
          setTypePlanningId={(id) => {
            setTypePlanningId(id);
            if (isBillingView) setRowSelection({});
          }}
          typesCurrency={allTypesCurrency}
          typeCurrencyId={efecctiveTypeCurrencyId}
          setTypeCurrencyId={setTypeCurrencyId}
          allowClearTypePlanning={!isBillingView}
        />
      </WorkOrderTable>

      <DataTablePagination
        page={page}
        totalPages={currentData?.meta?.last_page || 1}
        totalData={currentData?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
