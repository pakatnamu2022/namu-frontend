"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { VEHICLES_PV } from "@/features/ap/comercial/vehiculos/lib/vehicles.constants";
import { updateVehicle } from "@/features/ap/comercial/vehiculos/lib/vehicles.actions";
import { VehiclePVForm } from "@/features/ap/comercial/vehiculos/components/VehiclePVForm";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import { VehicleSchema } from "@/features/ap/comercial/vehiculos/lib/vehicles.schema";
import { notFound } from "@/shared/hooks/useNotFound";
import { useVehicleById } from "@/features/ap/comercial/vehiculos/lib/vehicles.hook";

export default function UpdateVehiclePVPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = VEHICLES_PV;

  const { data: vehicle, isLoading: loadingVehicle } = useVehicleById(
    Number(id)
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data: VehicleSchema) => updateVehicle(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  function mapVehicleToForm(data: VehicleResource): Partial<VehicleSchema> {
    return {
      vin: data.vin,
      year: data.year,
      plate: data.plate,
      engine_number: data.engine_number,
      ap_models_vn_id: String(data.ap_models_vn_id),
      vehicle_color_id: String(data.vehicle_color_id),
      engine_type_id: String(data.engine_type_id),
      warehouse_physical_id: String(data.warehouse_physical_id),
      sede_id: String(data.sede_warehouse_id),
    };
  }

  const isLoadingAny = loadingVehicle || !vehicle;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <VehiclePVForm
        defaultValues={mapVehicleToForm(vehicle)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
