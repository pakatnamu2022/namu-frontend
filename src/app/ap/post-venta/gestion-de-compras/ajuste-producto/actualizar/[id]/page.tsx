"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  findAdjustmentsProductById,
  updateAdjustmentsProduct,
} from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.actions";
import { AdjustmentSchema } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.schema";
import { AdjustmentsProductResource } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.interface";
import { AdjustmentsProductForm } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/components/AdjustmentsProductForm";
import { ADJUSTMENT } from "@/features/ap/post-venta/gestion-compras/ajuste-producto/lib/adjustmentsProduct.constants";

export default function UpdateAdjustmentsProductPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, QUERY_KEY, ABSOLUTE_ROUTE } = ADJUSTMENT;

  const { data: adjustment, isLoading: loadingAdjustment } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAdjustmentsProductById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AdjustmentSchema) =>
      updateAdjustmentsProduct(Number(id), data),
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

  const handleSubmit = (data: AdjustmentSchema) => {
    mutate(data);
  };

  function mapAdjustmentToForm(
    data: AdjustmentsProductResource
  ): Partial<AdjustmentSchema> {
    return {
      movement_type: data.movement_type,
      adjustment_reason_id: data.adjustment_reason_id ? String(data.adjustment_reason_id) : "",
      warehouse_id: String(data.warehouse_id),
      movement_date: data.movement_date ? new Date(data.movement_date) : new Date(),
      notes: data.notes || "",
      details:
        data.details?.map((item) => ({
          product_id: String(item.product_id),
          quantity: Number(item.quantity),
          unit_cost: item.unit_cost ? Number(item.unit_cost) : undefined,
          batch_number: item.batch_number || "",
          expiration_date: item.expiration_date ? new Date(item.expiration_date) : undefined,
          notes: item.notes || "",
        })) || [],
    };
  }

  const isLoadingAny = loadingAdjustment || !adjustment;

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
      <AdjustmentsProductForm
        defaultValues={mapAdjustmentToForm(adjustment)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
