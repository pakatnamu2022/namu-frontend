"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { BrandsSchema } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.schema.ts";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import { BrandsForm } from "@/features/ap/configuraciones/vehiculos/marcas/components/BrandsForm.tsx";
import { storeBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions.ts";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import { BRAND_POSTVENTA } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.constants.ts";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { CM_POSTVENTA_ID } from "@/core/core.constants.ts";

export default function AddBrandsPVPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = BRAND_POSTVENTA;
  const { mutate, isPending } = useMutation({
    mutationFn: storeBrands,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: BrandsSchema) => {
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
      <BrandsForm
        defaultValues={{
          code: "",
          dyn_code: "",
          name: "",
          description: "",
          group_id: "",
          type_operation_id: String(CM_POSTVENTA_ID),
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
