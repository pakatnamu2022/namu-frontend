"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  currentMonth,
  SUCCESS_MESSAGE,
  successToast,
  currentYear,
} from "@/src/core/core.function";
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { COMMERCIAL_MANAGER_BRAND_GROUP } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.constants";
import { CommercialManagerBrandGroupSchema } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.schema";
import { CommercialManagerBrandGroupForm } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupForm";
import { storeCommercialManagerBrandGroup } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.actions";

export default function CreateCommercialManagerBrandGroupPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = COMMERCIAL_MANAGER_BRAND_GROUP;

  const { mutate, isPending } = useMutation({
    mutationFn: storeCommercialManagerBrandGroup,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: CommercialManagerBrandGroupSchema) => {
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
      <CommercialManagerBrandGroupForm
        defaultValues={{
          year: currentYear(),
          month: currentMonth(),
          brand_group_id: "",
          commercial_managers: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
