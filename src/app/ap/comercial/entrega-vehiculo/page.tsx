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
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import VehicleDeliveryActions from "@/features/ap/comercial/entrega-vehiculo/components/VehicleDeliveryActions";
import VehicleDeliveryTable from "@/features/ap/comercial/entrega-vehiculo/components/VehicleDeliveryTable";
import { vehicleDeliveryColumns } from "@/features/ap/comercial/entrega-vehiculo/components/VehicleDeliveryColumns";
import VehicleDeliveryOptions from "@/features/ap/comercial/entrega-vehiculo/components/VehicleDeliveryOptions";
import {
  useVehicleDelivery,
  useSendVehicleDeliveryToNubefact,
  useQueryVehicleDeliveryFromNubefact,
  useSendVehicleDeliveryToDynamic,
} from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.hook";
import { deleteVehicleDelivery } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { VEHICLE_DELIVERY } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { VehicleDeliveryDetailsSheet } from "@/features/ap/comercial/entrega-vehiculo/components/VehicleDeliveryDetailsSheet";
import { VehiclesDeliveryResource } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.interface";
import { notFound } from "@/shared/hooks/useNotFound";


export default function VehicleDeliveryPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sendToNubefactId, setSendToNubefactId] = useState<number | null>(null);
  const [sendToDynamicId, setSendToDynamicId] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<VehiclesDeliveryResource | null>(null);
  const { MODEL, ROUTE } = VEHICLE_DELIVERY;
  const permissions = useModulePermissions(ROUTE);
  const sendToNubefactMutation = useSendVehicleDeliveryToNubefact();
  const queryFromNubefactMutation = useQueryVehicleDeliveryFromNubefact();
  const sendToDynamicMutation = useSendVehicleDeliveryToDynamic();

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useVehicleDelivery({
    page,
    search,
    per_page,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicleDelivery(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
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

  const handleSendToDynamic = async () => {
    if (!sendToDynamicId) return;
    sendToDynamicMutation.mutate(sendToDynamicId, {
      onSuccess: (response) => {
        if (response.success) {
          successToast(response.message);
        } else {
          errorToast(response.message || "Error al enviar a Dynamic");
        }
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || "Error al enviar a Dynamic";
        errorToast(errorMessage);
      },
      onSettled: () => {
        refetch();
        setSendToDynamicId(null);
      },
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
          subtitle={"Gestión de Entregas de Vehículos"}
          icon={currentView.icon}
        />
        <VehicleDeliveryActions permissions={permissions} />
      </HeaderTableWrapper>
      <VehicleDeliveryTable
        isLoading={isLoading}
        columns={vehicleDeliveryColumns({
          onDelete: setDeleteId,
          onSendToNubefact: setSendToNubefactId,
          onQueryFromNubefact: handleQueryFromNubefact,
          onSendToDynamic: setSendToDynamicId,
          onViewDetails: setSelectedVehicle,
          permissions,
        })}
        data={data?.data || []}
      >
        <VehicleDeliveryOptions search={search} setSearch={setSearch} />
      </VehicleDeliveryTable>

      {/* Sheet para ver detalles */}
      <VehicleDeliveryDetailsSheet
        open={!!selectedVehicle}
        onOpenChange={(open) => !open && setSelectedVehicle(null)}
        vehicleDelivery={selectedVehicle}
      />

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

      {sendToDynamicId !== null && (
        <SimpleConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setSendToDynamicId(null)}
          onConfirm={handleSendToDynamic}
          title="Enviar a Dynamic"
          description="¿Está seguro de que desea enviar este registro a Dynamic?"
          confirmText="Sí, enviar"
          cancelText="Cancelar"
          variant="default"
          icon="warning"
          isLoading={sendToDynamicMutation.isPending}
        />
      )}

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
