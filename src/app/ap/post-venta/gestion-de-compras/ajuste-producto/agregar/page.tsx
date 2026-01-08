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
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { storeAdjustmentsProduct } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.actions";
import { AdjustmentSchema } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.schema";
import { AdjustmentsProductForm } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/components/AdjustmentsProductForm";
import { ADJUSTMENT } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.constants";
import { AP_MASTER_TYPE } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

export default function AddAdjustmentsProductPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = ADJUSTMENT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeAdjustmentsProduct,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: AdjustmentSchema) => {
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
      <AdjustmentsProductForm
        defaultValues={{
          movement_type: AP_MASTER_TYPE.TYPE_ADJUSTMENT_IN,
          reason_in_out_id: "",
          warehouse_id: "",
          movement_date: "",
          notes: "",
          details: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
