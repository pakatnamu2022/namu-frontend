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
import { storeProductTransfer } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.actions.ts";
import { ProductTransferForm } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/components/ProductTransferForm.tsx";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.constants.ts";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants.ts";

export default function AddProductTransferPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PRODUCT_TRANSFER;
  const AUTOMOTORES_PAKATNAMU_ID = "17";

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
          document_series_id: "",
          movement_date: "",
          notes: "",
          driver_name: "",
          driver_doc: "",
          license: "",
          plate: "",
          issue_date: "",
          issuer_type: "NOSOTROS",
          document_type: "GUIA_REMISION",
          transfer_reason_id: SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE,
          transfer_modality_id: "",
          transport_company_id: "",
          total_packages: "1",
          total_weight: "0",
          transmitter_origin_id: AUTOMOTORES_PAKATNAMU_ID,
          receiver_destination_id: AUTOMOTORES_PAKATNAMU_ID,
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
