"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import {
  findProductTransferById,
  updateProductTransfer,
} from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.actions.ts";
import { ProductTransferSchema } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.schema.ts";
import { ProductTransferResource } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.interface.ts";
import { ProductTransferForm } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/components/ProductTransferForm.tsx";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-almacen/transferencia-producto/lib/productTransfer.constants.ts";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants.ts";
import { BUSINESS_PARTNERS } from "@/core/core.constants.ts";

export default function UpdateProductTransferPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, QUERY_KEY, ABSOLUTE_ROUTE } = PRODUCT_TRANSFER;
  const AUTOMOTORES_PAKATNAMU_ID = "17";

  const { data: transfer, isLoading: loadingTransfer } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProductTransferById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => updateProductTransfer(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: ProductTransferSchema) => {
    mutate(data);
  };

  function mapTransferToForm(
    data: ProductTransferResource
  ): Partial<ProductTransferSchema> {
    return {
      warehouse_origin_id: String(data.warehouse_origin_id),
      warehouse_destination_id: String(data.warehouse_destination_id),
      document_series_id: String(data.reference.document_series_id),
      movement_date: data.movement_date
        ? new Date(data.movement_date)
        : new Date(),
      notes: data.notes || "",
      driver_name: data.reference.driver_name,
      driver_doc: data.reference.driver_doc,
      license: data.reference.license,
      plate: data.reference.plate,
      issuer_type: "NOSOTROS",
      item_type: data.item_type,
      document_type: "GUIA_REMISION",
      transfer_reason_id: SUNAT_CONCEPTS_ID.TRANSFER_REASON_TRASLADO_SEDE,
      type_person_id:
        !data.reference.driver_doc || data.reference.driver_doc === ""
          ? BUSINESS_PARTNERS.TYPE_PERSON_JURIDICA_ID
          : BUSINESS_PARTNERS.TYPE_PERSON_NATURAL_ID,
      transfer_modality_id: String(data.reference.transfer_modality_id),
      transport_company_id: String(data.reference.transport_company_id),
      transmitter_origin_id: AUTOMOTORES_PAKATNAMU_ID,
      receiver_destination_id: AUTOMOTORES_PAKATNAMU_ID,
      total_packages: String(data.reference.total_packages),
      total_weight: String(data.reference.total_weight),
      issue_date: data.created_at ? new Date(data.created_at) : undefined,
      details:
        data.details?.map((item) => ({
          product_id: String(item.product_id),
          quantity: String(item.quantity),
          unit_cost: String(item.unit_cost),
          notes: item.notes || "",
          description: item.notes,
        })) || [],
    };
  }

  const isLoadingAny = loadingTransfer || !transfer;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <ProductTransferForm
        defaultValues={mapTransferToForm(transfer)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE)}
        transferData={transfer}
      />
    </FormWrapper>
  );
}
