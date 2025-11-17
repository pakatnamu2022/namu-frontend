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
import { BrandsSchema } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { BrandsForm } from "@/features/ap/configuraciones/vehiculos/marcas/components/BrandsForm";
import { storeBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";
import FormWrapper from "@/shared/components/FormWrapper";
import { BRAND } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.constants";
import NotFound from "@/app/not-found";

export default function CreateBrandsPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = BRAND;
  const { mutate, isPending } = useMutation({
    mutationFn: storeBrands,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: BrandsSchema) => {
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
      <BrandsForm
        defaultValues={{
          code: "",
          dyn_code: "",
          name: "",
          description: "",
          group_id: "",
          is_commercial: true,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
