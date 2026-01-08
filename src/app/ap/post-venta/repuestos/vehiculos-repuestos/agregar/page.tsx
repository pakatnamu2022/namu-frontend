"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import { VEHICLES_RP } from "@/features/ap/comercial/vehiculos/lib/vehicles.constants";
import { storeVehicle } from "@/features/ap/comercial/vehiculos/lib/vehicles.actions";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { VehiclePVForm } from "@/features/ap/comercial/vehiculos/components/VehiclePVForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddVehicleRepuestoPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = VEHICLES_RP;

  const { mutate, isPending } = useMutation({
    mutationFn: storeVehicle,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <VehiclePVForm
        defaultValues={{
          vin: "",
          plate: "",
          year: new Date().getFullYear(),
          engine_number: "",
          ap_models_vn_id: "",
          vehicle_color_id: "",
          engine_type_id: "",
          warehouse_physical_id: "",
          type_operation_id: "",
          sede_id: "",
          customer_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
