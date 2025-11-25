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
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import { APPROVED_ACCESSORIES } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.constants.ts";
import { storeApprovedAccesories } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.actions.ts";
import { ApprovedAccesoriesSchema } from "@/features/ap/post-venta/repuestos/accesorios-homologados/lib/approvedAccessories.schema.ts";
import { ApprovedAccesoriesForm } from "@/features/ap/post-venta/repuestos/accesorios-homologados/components/ApprovedAccessoriesForm.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";

export default function AddApprovedAccesoriesPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = APPROVED_ACCESSORIES;

  const { mutate, isPending } = useMutation({
    mutationFn: storeApprovedAccesories,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ApprovedAccesoriesSchema) => {
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
          code: "",
          type: "SERVICIO",
          description: "",
          price: 0,
          body_type_id: "",
          type_currency_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
