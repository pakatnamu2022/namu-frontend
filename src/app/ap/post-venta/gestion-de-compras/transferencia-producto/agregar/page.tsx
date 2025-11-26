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
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { storeProductTransfer } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.actions.ts";
import { ProductTransferForm } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/components/ProductTransferForm.tsx";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.constants.ts";

export default function AddProductTransferPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PRODUCT_TRANSFER;

  const { mutate, isPending } = useMutation({
    mutationFn: storeProductTransfer,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
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
      <ProductTransferForm
        defaultValues={{
          warehouse_origin_id: "",
          warehouse_destination_id: "",
          movement_date: "",
          notes: "",
          reason_in_out_id: "",
          driver_name: "",
          driver_doc: "",
          license: "",
          plate: "",
          transfer_reason_id: "",
          transfer_modality_id: "",
          transport_company_id: "",
          total_packages: "1",
          total_weight: "0",
          origin_ubigeo: "",
          origin_address: "",
          destination_ubigeo: "",
          destination_address: "",
          ruc_transport: "",
          company_name_transport: "",
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
