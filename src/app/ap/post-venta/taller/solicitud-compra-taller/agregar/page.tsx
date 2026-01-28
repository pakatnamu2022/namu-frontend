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
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { PURCHASE_REQUEST_TALLER } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.constants.ts";
import PurchaseRequestForm from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestForm.tsx";
import { storePurchaseRequest } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.actions.ts";
import { PurchaseRequestSchema } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.schema.ts";

export default function AddPurchaseRequestPVPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PURCHASE_REQUEST_TALLER;

  const { mutate, isPending } = useMutation({
    mutationFn: storePurchaseRequest,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: PurchaseRequestSchema) => {
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
      <PurchaseRequestForm
        defaultValues={{
          requested_date: "",
          observations: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
