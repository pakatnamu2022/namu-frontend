"use client";

import { useNavigate } from 'react-router-dom';
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  currentMonth,
  SUCCESS_MESSAGE,
  successToast,
  currentYear,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { COMMERCIAL_MANAGER_BRAND_GROUP } from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.constants";
import { CommercialManagerBrandGroupSchema } from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.schema";
import { CommercialManagerBrandGroupForm } from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupForm";
import { storeCommercialManagerBrandGroup } from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.actions";
import NotFound from "@/app/not-found";


export default function CreateCommercialManagerBrandGroupPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = COMMERCIAL_MANAGER_BRAND_GROUP;

  const { mutate, isPending } = useMutation({
    mutationFn: storeCommercialManagerBrandGroup,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: CommercialManagerBrandGroupSchema) => {
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
