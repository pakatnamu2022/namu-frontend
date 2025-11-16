"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { storeModelsVn } from "@/src/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.actions";
import { ModelsVnSchema } from "@/src/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.schema";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { ModelsVnForm } from "@/src/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelsVnForm";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { MODELS_VN } from "@/src/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.constanst";

export default function CreateModelsVnPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = MODELS_VN;

  const { mutate, isPending } = useMutation({
    mutationFn: storeModelsVn,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ModelsVnSchema) => {
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
      <ModelsVnForm
        defaultValues={{
          code: "",
          version: "",
          power: "",
          model_year: new Date().getFullYear(),
          wheelbase: "",
          axles_number: "",
          width: "",
          length: "",
          height: "",
          seats_number: "",
          doors_number: "",
          net_weight: "",
          gross_weight: "",
          payload: "",
          displacement: "",
          cylinders_number: "",
          passengers_number: "",
          wheels_number: "",
          distributor_price: 0.0,
          transport_cost: 370,
          other_amounts: 0.0,
          purchase_discount: 7,
          igv_amount: 0.0,
          total_purchase_excl_igv: 0.0,
          total_purchase_incl_igv: 0.0,
          sale_price: 0.0,
          margin: 7,
          family_id: "",
          class_id: "",
          fuel_id: "",
          vehicle_type_id: "",
          body_type_id: "",
          traction_type_id: "",
          transmission_id: "",
          currency_type_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
