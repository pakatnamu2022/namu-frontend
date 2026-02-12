"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import VehicleDeliveryActions from "@/features/ap/comercial/entrega-vehiculo/components/VehicleDeliveryActions";
import VehicleDeliveryTable from "@/features/ap/comercial/entrega-vehiculo/components/VehicleDeliveryTable";
import {
  useVehicleDelivery,
  useUpdateVehicleDelivery,
} from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.hook";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { CARD_WASH_ROUTE } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { cardWashColumns } from "@/features/ap/comercial/entrega-vehiculo/components/CardWashColumns";
import { notFound } from "@/shared/hooks/useNotFound";
import { errorToast, successToast } from "@/core/core.function";

export default function CardWashPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const ROUTE = CARD_WASH_ROUTE;
  const permissions = useModulePermissions(ROUTE);

  const updateVehicleDeliveryMutation = useUpdateVehicleDelivery();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [per_page]);

  const { data, isLoading } = useVehicleDelivery({
    page,
    per_page,
  });

  const handleConfirmWash = async (id: number) => {
    try {
      await updateVehicleDeliveryMutation.mutateAsync({
        id,
        data: { status_wash: "completed" },
      });
      successToast("Lavado confirmado exitosamente");
    } catch (error) {
      errorToast("Error al confirmar el lavado");
      console.error(error);
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
          subtitle={"Gestión de Entregas de Vehículos"}
          icon={currentView.icon}
        />
        <VehicleDeliveryActions permissions={permissions} />
      </HeaderTableWrapper>
      <VehicleDeliveryTable
        isLoading={isLoading}
        columns={cardWashColumns({
          permissions,
          onConfirmWash: handleConfirmWash,
        })}
        data={data?.data || []}
      ></VehicleDeliveryTable>

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
