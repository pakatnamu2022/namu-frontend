"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import {
  errorToast,
  getCurrentDayOfMonth,
  getFirstDayOfMonth,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import {
  WORK_ORDER_STATUS_ID,
  WORKER_ORDER_CAJA,
} from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
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

export default function WorkOrderCajaPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [activeView, setActiveView] = useState<WorkOrderCajaView>("OT");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
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
  };

  const commonParams = {
    page,
    search,
    per_page,
    opening_date:
      dateFrom && dateTo
        ? [formatDate(dateFrom), formatDate(dateTo)]
        : undefined,
  };

  const { data: dataOT, isLoading: isLoadingOT } = useGetWorkOrder({
    params: {
      ...commonParams,
      status_id: [
        WORK_ORDER_STATUS_ID.RECEPCIONADO,
        WORK_ORDER_STATUS_ID.EN_TRABAJO,
        WORK_ORDER_STATUS_ID.TERMINADO,
        WORK_ORDER_STATUS_ID.CERRADO,
      ],
    },
  });

  const { data: dataPending, isLoading: isLoadingPending } =
    useGetWorkOrderWithInternalNotes({
      params: {
        ...commonParams,
        internal_note_status: "pending",
      },
    });

  const { data: dataInvoiced, isLoading: isLoadingInvoiced } =
    useGetWorkOrderWithInternalNotes({
      params: {
        ...commonParams,
        internal_note_status: "invoiced",
      },
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

  const handleManage = (id: number) => {
    router(`${ABSOLUTE_ROUTE}/gestionar/${id}`);
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
        <WorkOrderActionsFilters
          activeView={activeView}
          onViewChange={handleViewChange}
        />
      </HeaderTableWrapper>

      <WorkOrderTable
        isLoading={currentIsLoading}
        columns={workOrderCajaColumns({
          onManage: handleManage,
          permissions,
        })}
        data={currentData?.data || []}
      >
        <WorkOrderOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={handleDateFromChange}
          dateTo={dateTo}
          setDateTo={setDateTo}
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
