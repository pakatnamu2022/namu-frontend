"use client";

import { useNavigate } from 'react-router-dom';
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { VEHICLE_DELIVERY } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.constants";
import { storeVehicleDelivery } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.actions";
import { VehicleDeliverySchema } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.schema";
import { VehicleDeliveryForm } from "@/features/ap/comercial/entrega-vehiculo/components/VehicleDeliveryForm";
import { format } from "date-fns";
import { notFound } from "@/shared/hooks/useNotFound";


export default function AddVehicleDeliveryPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = VEHICLE_DELIVERY;

  const { mutate, isPending } = useMutation({
    mutationFn: storeVehicleDelivery,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(`/ap/comercial/${ROUTE}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: VehicleDeliverySchema) => {
    // Format dates before sending
    const formattedData = {
      ...data,
      scheduled_delivery_date: format(
        data.scheduled_delivery_date,
        "yyyy-MM-dd"
      ),
      wash_date: format(data.wash_date, "yyyy-MM-dd"),
    };
    mutate(formattedData);
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
      <VehicleDeliveryForm
        defaultValues={{
          vehicle_id: "",
          scheduled_delivery_date: new Date(),
          wash_date: new Date(),
          observations: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(`/ap/comercial/${ROUTE}`)}
      />
    </FormWrapper>
  );
}
