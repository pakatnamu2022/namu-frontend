"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { EXHIBITION_VEHICLES } from "@/features/ap/comercial/vehiculos-exhibicion/lib/exhibitionVehicles.constants";
import { ExhibitionVehiclesForm } from "@/features/ap/comercial/vehiculos-exhibicion/components/ExhibitionVehiclesForm";
import {
  useUpdateExhibitionVehicles,
  useExhibitionVehiclesById,
} from "@/features/ap/comercial/vehiculos-exhibicion/lib/exhibitionVehicles.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateExhibitionVehiclesPage() {
  const { id } = useParams<{ id: string }>();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const navigate = useNavigate();
  const { MODEL, ROUTE } = EXHIBITION_VEHICLES;

  const { data: exhibitionVehicle, isLoading: isLoadingData } =
    useExhibitionVehiclesById(Number(id));
  const updateMutation = useUpdateExhibitionVehicles();

  const handleSubmit = (data: any) => {
    if (!id) return;

    updateMutation.mutate(
      { id: Number(id), payload: data },
      {
        onSuccess: () => {
          successToast(SUCCESS_MESSAGE(MODEL, "update"));
          navigate(ROUTE);
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message || "";
          errorToast(ERROR_MESSAGE(MODEL, "update", msg));
        },
      }
    );
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  if (isLoadingData) {
    return (
      <div className="space-y-4">
        <HeaderTableWrapper>
          <TitleComponent
            title={`Actualizar ${MODEL}`}
            subtitle={`Editar un ${MODEL.toLowerCase()} existente`}
            icon={currentView.icon}
          />
        </HeaderTableWrapper>
        <FormSkeleton />
      </div>
    );
  }

  if (!exhibitionVehicle) {
    return (
      <div className="space-y-4">
        <HeaderTableWrapper>
          <TitleComponent
            title={`Actualizar ${MODEL}`}
            subtitle={`Editar un ${MODEL.toLowerCase()} existente`}
            icon={currentView.icon}
          />
        </HeaderTableWrapper>
        <div className="bg-white rounded-lg border p-6 text-center">
          <p className="text-muted-foreground">
            No se encontró el registro solicitado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={`Actualizar ${MODEL}`}
          subtitle={`Editar el ${MODEL.toLowerCase()} #${id}`}
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <div className="bg-white rounded-lg border p-6">
        <ExhibitionVehiclesForm
          defaultValues={{
            supplier_id: exhibitionVehicle.supplier_id,
            guia_number: exhibitionVehicle.guia_number,
            guia_date: exhibitionVehicle.guia_date,
            llegada: exhibitionVehicle.llegada,
            ubicacion_id: exhibitionVehicle.ubicacion_id,
            advisor_id: exhibitionVehicle.advisor_id,
            propietario_id: exhibitionVehicle.propietario_id,
            ap_vehicle_status_id: exhibitionVehicle.ap_vehicle_status_id,
            pedido_sucursal: exhibitionVehicle.pedido_sucursal || "",
            dua_number: exhibitionVehicle.dua_number,
            observaciones: exhibitionVehicle.observaciones,
            status: exhibitionVehicle.status,
            items: exhibitionVehicle.items as any,
          }}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
          mode="update"
          isLoadingData={isLoadingData}
        />
      </div>
    </div>
  );
}
