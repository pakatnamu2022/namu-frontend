"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { CONTROL_UNITS } from "@/features/ap/comercial/control-unidades/lib/controlUnits.constants";
import {
  useDeleteControlUnits,
  useControlUnits,
  useMarkAsReceived,
  useCancelShippingGuide,
  useSendControlUnitsToNubefact,
  useQueryControlUnitsFromNubefact,
} from "@/features/ap/comercial/control-unidades/lib/controlUnits.hook";
import ControlUnitsTable from "@/features/ap/comercial/control-unidades/components/ControlUnitsTable";
import { ControlUnitsColumns } from "@/features/ap/comercial/control-unidades/components/ControlUnitsColumns";
import ControlUnitsActions from "@/features/ap/comercial/control-unidades/components/ControlUnitsActions";
import ControlUnitsOptions from "@/features/ap/comercial/control-unidades/components/ControlUnitsOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { MarkAsReceivedDialog } from "@/features/ap/comercial/control-unidades/components/MarkAsReceivedDialog";
import { ReasonDialog } from "@/shared/components/ReasonDialog";
import { Ban } from "lucide-react";
import { ControlUnitsResource } from "@/features/ap/comercial/control-unidades/lib/controlUnits.interface";
import { SheetShipmentDetailsDialog } from "@/features/ap/comercial/control-unidades/components/SheetShipmentDetailsDialog";
import { notFound } from "@/shared/hooks/useNotFound";
import { format } from "date-fns";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";

export default function ControlUnitsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  const formattedDateFrom = dateFrom
    ? format(dateFrom, "yyyy-MM-dd")
    : undefined;
  const formattedDateTo = dateTo ? format(dateTo, "yyyy-MM-dd") : undefined;

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [markAsReceivedId, setMarkAsReceivedId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [selectedShipment, setSelectedShipment] =
    useState<ControlUnitsResource | null>(null);
  const { ROUTE } = CONTROL_UNITS;
  const deleteMutation = useDeleteControlUnits();
  const markAsReceivedMutation = useMarkAsReceived();
  const cancelMutation = useCancelShippingGuide();
  const sendToNubefactMutation = useSendControlUnitsToNubefact();
  const queryFromNubefactMutation = useQueryControlUnitsFromNubefact();
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch, isFetching } = useControlUnits({
    page,
    search,
    per_page,
    issue_date: [formattedDateFrom, formattedDateTo],
    area_id: AREA_COMERCIAL,
    send_dynamics: 0,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        refetch();
        setDeleteId(null);
      },
    });
  };

  const handleMarkAsReceived = (note?: string) => {
    if (!markAsReceivedId) return;
    markAsReceivedMutation.mutate(
      { id: markAsReceivedId, note },
      {
        onSettled: () => {
          refetch();
          setMarkAsReceivedId(null);
        },
      },
    );
  };

  const handleCancel = (reason: string) => {
    if (!cancelId) return;
    cancelMutation.mutate(
      { id: cancelId, cancellation_reason: reason },
      {
        onSettled: () => {
          refetch();
          setCancelId(null);
        },
      },
    );
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
        <ControlUnitsActions
          isFetching={isFetching && !isLoading}
          onRefresh={refetch}
          permissions={permissions}
        />
      </HeaderTableWrapper>

      <ControlUnitsTable
        isLoading={isLoading}
        columns={ControlUnitsColumns({
          onDelete: setDeleteId,
          onMarkAsReceived: setMarkAsReceivedId,
          onViewDetails: setSelectedShipment,
          onCancel: setCancelId,
          onSendToNubefact: (id) => sendToNubefactMutation.mutate(id),
          onQueryFromNubefact: (id) => queryFromNubefactMutation.mutate(id),
          permissions,
        })}
        data={data?.data || []}
      >
        <ControlUnitsOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          dateTo={dateTo}
          setDateRange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
        />
      </ControlUnitsTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {markAsReceivedId !== null && (
        <MarkAsReceivedDialog
          open={true}
          onOpenChange={(open) => !open && setMarkAsReceivedId(null)}
          onConfirm={handleMarkAsReceived}
          isLoading={markAsReceivedMutation.isPending}
        />
      )}

      {cancelId !== null && (
        <ReasonDialog
          open={true}
          onOpenChange={(open) => !open && setCancelId(null)}
          onConfirm={handleCancel}
          isLoading={cancelMutation.isPending}
          title="Cancelar Guía de Remisión"
          description="Está a punto de cancelar esta guía de remisión. Por favor, indique el motivo de la cancelación."
          icon={Ban}
          iconBgColor="bg-red-100"
          iconColor="text-red-600"
          placeholder="Ej: Cliente solicitó cancelación, error en los datos, etc."
          confirmText="Confirmar cancelación"
          cancelText="Volver"
          fieldLabel="Motivo de cancelación"
          required={true}
        />
      )}

      {/* Sheet para ver detalles */}
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
