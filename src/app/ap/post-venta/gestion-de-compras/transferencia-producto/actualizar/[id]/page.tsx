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
} from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.actions.ts";
import { ProductTransferSchema } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.schema.ts";
import { ProductTransferResource } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.interface.ts";
import { ProductTransferForm } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/components/ProductTransferForm.tsx";
import { PRODUCT_TRANSFER } from "@/features/ap/post-venta/gestion-compras/transferencia-producto/lib/productTransfer.constants.ts";

export default function UpdateProductTransferPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, QUERY_KEY, ABSOLUTE_ROUTE } = PRODUCT_TRANSFER;

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
      movement_date: data.movement_date
        ? new Date(data.movement_date)
        : new Date(),
      notes: data.notes || "",
      reason_in_out_id: String(data.reason_in_out_id),
      driver_name: data.driver_name,
      driver_doc: data.driver_doc,
      license: data.license,
      plate: data.plate,
      transfer_reason_id: String(data.transfer_reason_id),
      transfer_modality_id: String(data.transfer_modality_id),
      transport_company_id: String(data.transport_company_id),
      total_packages: String(data.total_packages),
      total_weight: String(data.total_weight),
      origin_ubigeo: data.origin_ubigeo,
      origin_address: data.origin_address,
      destination_ubigeo: data.destination_ubigeo,
      destination_address: data.destination_address,
      ruc_transport: data.ruc_transport,
      company_name_transport: data.company_name_transport,
      details:
        data.details?.map((item) => ({
          product_id: String(item.product_id),
          quantity: String(item.quantity),
          unit_cost: String(item.unit_cost),
          notes: item.notes || "",
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
      />
    </FormWrapper>
  );
}
