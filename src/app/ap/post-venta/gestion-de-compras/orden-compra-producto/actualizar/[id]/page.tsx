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
  findPurchaseOrderProductsById,
  updatePurchaseOrderProducts,
} from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.actions";
import { PurchaseOrderProductsSchema } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.schema";
import { PurchaseOrderProductsResource } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.interface";
import { PurchaseOrderProductsForm } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsForm";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.constants";

export default function UpdatePurchaseOrderProductsPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, QUERY_KEY, ABSOLUTE_ROUTE } = PURCHASE_ORDER_PRODUCT;

  const { data: purchaseOrder, isLoading: loadingPurchaseOrder } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPurchaseOrderProductsById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PurchaseOrderProductsSchema) =>
      updatePurchaseOrderProducts(Number(id), data),
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

  const handleSubmit = (data: PurchaseOrderProductsSchema) => {
    mutate(data);
  };

  function mapPurchaseOrderToForm(
    data: PurchaseOrderProductsResource
  ): Partial<PurchaseOrderProductsSchema> {
    return {
      supplier_id: String(data.supplier_id),
      invoice_series: data.invoice_series,
      invoice_number: data.invoice_number,
      emission_date: data.emission_date
        ? new Date(data.emission_date + "T00:00:00")
        : "",
      due_date: data.due_date ? new Date(data.due_date + "T00:00:00") : "",
      sede_id: String(data.sede_id),
      warehouse_id: String(data.warehouse_id),
      currency_id: String(data.currency_id),
      payment_terms: data.payment_terms,
      notes: data.notes,
      items:
        data.items?.map((item) => ({
          product_id: String(item.product_id),
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_total: item.total,
          notes: item.description,
        })) || [],
    };
  }

  const isLoadingAny = loadingPurchaseOrder || !purchaseOrder;

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
      <PurchaseOrderProductsForm
        defaultValues={mapPurchaseOrderToForm(purchaseOrder)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE)}
        PurchaseOrderProductsData={purchaseOrder}
      />
    </FormWrapper>
  );
}
