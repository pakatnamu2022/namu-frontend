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
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { notFound } from "@/shared/hooks/useNotFound";
import { PURCHASE_REQUEST_REPUESTOS } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.constants";
import PurchaseRequestForm from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestForm";
import { storePurchaseRequest } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.actions";
import { PurchaseRequestSchema } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.schema";

export default function AddPurchaseRequestRepuestoPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PURCHASE_REQUEST_REPUESTOS;

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
          supply_type: "LIMA",
          requested_date: new Date().toISOString().split("T")[0] || "",
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
