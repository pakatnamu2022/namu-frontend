"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import { SimpleConfirmDialog } from "@/src/shared/components/SimpleConfirmDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { SHIPMENTS_RECEPTIONS } from "@/src/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.constants";
import {
  useDeleteShipmentsReceptions,
  useQueryShippingGuideFromNubefact,
  useSendShippingGuideToNubefact,
  useShipmentsReceptions,
  useMarkAsReceived,
  useCancelShippingGuide,
} from "@/src/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.hook";
import ShipmentsReceptionsTable from "@/src/features/ap/comercial/envios-recepciones/components/ShipmentsReceptionsTable";
import { shipmentsReceptionsColumns } from "@/src/features/ap/comercial/envios-recepciones/components/ShipmentsReceptionsColumns";
import ShipmentsReceptionsActions from "@/src/features/ap/comercial/envios-recepciones/components/ShipmentsReceptionsActions";
import ShipmentsReceptionsOptions from "@/src/features/ap/comercial/envios-recepciones/components/ShipmentsReceptionsOptions";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";
import { MarkAsReceivedDialog } from "@/src/features/ap/comercial/envios-recepciones/components/MarkAsReceivedDialog";
import { ReasonDialog } from "@/src/shared/components/ReasonDialog";
import { Ban } from "lucide-react";
import { ShipmentsReceptionsResource } from "@/src/features/ap/comercial/envios-recepciones/lib/shipmentsReceptions.interface";
import { SheetShipmentDetailsDialog } from "@/src/features/ap/comercial/envios-recepciones/components/SheetShipmentDetailsDialog";

export default function ShipmentsReceptionsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sendToNubefactId, setSendToNubefactId] = useState<number | null>(null);
  const [markAsReceivedId, setMarkAsReceivedId] = useState<number | null>(null);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [selectedShipment, setSelectedShipment] =
    useState<ShipmentsReceptionsResource | null>(null);
  const { MODEL, ROUTE } = SHIPMENTS_RECEPTIONS;
  const deleteMutation = useDeleteShipmentsReceptions();
  const sendToNubefactMutation = useSendShippingGuideToNubefact();
  const queryFromNubefactMutation = useQueryShippingGuideFromNubefact();
  const markAsReceivedMutation = useMarkAsReceived();
  const cancelMutation = useCancelShippingGuide();
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useShipmentsReceptions({
    page,
    search,
    per_page,
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

  const handleSendToNubefact = async () => {
    if (!sendToNubefactId) return;
    sendToNubefactMutation.mutate(sendToNubefactId, {
      onSettled: () => {
        refetch();
        setSendToNubefactId(null);
      },
    });
  };

  const handleQueryFromNubefact = (id: number) => {
    queryFromNubefactMutation.mutate(id, {
      onSettled: () => {
        refetch();
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
      }
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
      }
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
        <ShipmentsReceptionsActions permissions={permissions} />
      </HeaderTableWrapper>

      <ShipmentsReceptionsTable
        isLoading={isLoading}
        columns={shipmentsReceptionsColumns({
          onDelete: setDeleteId,
          onSendToNubefact: setSendToNubefactId,
          onQueryFromNubefact: handleQueryFromNubefact,
          onMarkAsReceived: setMarkAsReceivedId,
          onViewDetails: setSelectedShipment,
          onCancel: setCancelId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ShipmentsReceptionsOptions search={search} setSearch={setSearch} />
      </ShipmentsReceptionsTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {sendToNubefactId !== null && (
        <SimpleConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setSendToNubefactId(null)}
          onConfirm={handleSendToNubefact}
          title="Enviar a Nubefact"
          description="¿Está seguro de que desea enviar esta guía de remisión a Nubefact? Una vez enviada, no podrá editarla ni eliminarla."
          confirmText="Sí, enviar"
          cancelText="Cancelar"
          variant="default"
          icon="warning"
          isLoading={sendToNubefactMutation.isPending}
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
