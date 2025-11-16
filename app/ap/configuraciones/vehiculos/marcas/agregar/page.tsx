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
import { BrandsSchema } from "@/src/features/ap/configuraciones/vehiculos/marcas/lib/brands.schema";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { BrandsForm } from "@/src/features/ap/configuraciones/vehiculos/marcas/components/BrandsForm";
import { storeBrands } from "@/src/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { BRAND } from "@/src/features/ap/configuraciones/vehiculos/marcas/lib/brands.constants";

export default function CreateBrandsPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = BRAND;
  const { mutate, isPending } = useMutation({
    mutationFn: storeBrands,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
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
          is_commercial: true,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
