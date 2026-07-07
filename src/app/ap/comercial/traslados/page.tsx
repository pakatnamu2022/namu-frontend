"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import { format } from "date-fns";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import {
  useShipmentsReceptions,
  useSyncShippingGuideWithDynamics,
} from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.hook";
import { ShipmentsReceptionsResource } from "@/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface";
import { SheetShipmentDetailsDialog } from "@/features/ap/comercial/envios-recepciones/components/SheetShipmentDetailsDialog";
import { TRANSFERS } from "@/features/ap/comercial/traslados/lib/transfers.constants";
import { TransfersColumns } from "@/features/ap/comercial/traslados/components/TransfersColumns";
import TransfersTable from "@/features/ap/comercial/traslados/components/TransfersTable";
import TransfersActions from "@/features/ap/comercial/traslados/components/TransfersActions";
import TransfersOptions from "@/features/ap/comercial/traslados/components/TransfersOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import { useMutation } from "@tanstack/react-query";
import { dispatchShippingGuideMigration } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.actions";
import { errorToast, successToast } from "@/core/core.function";

export default function TransfersPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentsReceptionsResource | null>(null);

  const { ROUTE } = TRANSFERS;
  const permissions = useModulePermissions(ROUTE);

  const formattedDateFrom = dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined;
  const formattedDateTo = dateTo ? format(dateTo, "yyyy-MM-dd") : undefined;

  const { data, isLoading, refetch, isFetching } = useShipmentsReceptions({
    page,
    search,
    per_page,
    issue_date: [formattedDateFrom, formattedDateTo],
    document_type: "GUIA_INTERNA",
  });

  const migrateMutation = useMutation({
    mutationFn: dispatchShippingGuideMigration,
    onSuccess: () => successToast("Migración despachada correctamente"),
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al despachar migración: ${msg}`);
    },
  });
  const syncWithDynamicsMutation = useSyncShippingGuideWithDynamics();

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
        <TransfersActions
          isFetching={isFetching && !isLoading}
          onRefresh={refetch}
          permissions={permissions}
        />
      </HeaderTableWrapper>

      <TransfersTable
        isLoading={isLoading}
        columns={TransfersColumns({
          onViewDetails: setSelectedShipment,
          onMigrate: (id) => migrateMutation.mutate(id),
          onSyncWithDynamics: (id) => syncWithDynamicsMutation.mutate(id),
        })}
        data={data?.data || []}
      >
        <TransfersOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          dateTo={dateTo}
          setDateRange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
        />
      </TransfersTable>

      <SheetShipmentDetailsDialog
        open={!!selectedShipment}
        onOpenChange={(open) => !open && setSelectedShipment(null)}
        shipment={selectedShipment}
      />

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
