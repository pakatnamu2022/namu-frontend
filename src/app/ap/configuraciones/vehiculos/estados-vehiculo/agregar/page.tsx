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
import { storeVehicleStatus } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.actions";
import { VehicleStatusSchema } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { VehicleStatusForm } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/components/VehicleStatusForm";
import FormWrapper from "@/shared/components/FormWrapper";
import { VEHICLE_STATUS } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.constants";
import NotFound from "@/app/not-found";

export default function AddVehicleStatusPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = VEHICLE_STATUS;

  const { mutate, isPending } = useMutation({
    mutationFn: storeVehicleStatus,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: VehicleStatusSchema) => {
    mutate(data);
  };
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <VehicleStatusForm
        defaultValues={{
          code: "",
          description: "",
          use: "",
          color: "",
          status: true,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
