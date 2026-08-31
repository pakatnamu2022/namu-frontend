"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import { APPROVED_ACCESSORIES } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.constants.ts";
import { storeApprovedAccesories } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.actions.ts";
import { ApprovedAccesoriesForm } from "@/features/ap/post-venta/repuestos/accesorios-homologados/components/ApprovedAccessoriesForm.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

export default function AddApprovedAccesoriesPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = APPROVED_ACCESSORIES;

  const [serverError, setServerError] = useState<string | undefined>();

  const { mutate, isPending } = useMutation({
    mutationFn: storeApprovedAccesories,
    onSuccess: () => {
      setServerError(undefined);
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      setServerError(msg || undefined);
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
      <ApprovedAccesoriesForm
        defaultValues={{
          type_operation_id: CM_COMERCIAL_ID,
          description: "",
          priceGroups: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        serverError={serverError}
      />
    </FormWrapper>
  );
}
