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
import NotFound from "@/app/not-found";
import {
  findPurchaseOrderProductsById,
  updatePurchaseOrderProducts,
} from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.actions";
import { PurchaseOrderProductsSchema } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.schema";
import { PurchaseOrderProductsResource } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.interface";
import { PurchaseOrderProductsForm } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsForm";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.constants";

export default function EditPurchaseOrderProductsPage() {
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
      order_number: data.order_number,
      supplier_id: String(data.supplier_id),
      order_date: data.order_date,
      expected_delivery_date: data.expected_delivery_date,
      payment_terms: data.payment_terms,
      shipping_method: data.shipping_method,
      warehouse_id: data.warehouse_id ? String(data.warehouse_id) : "",
      subtotal: data.subtotal,
      total_discount: data.total_discount,
      total_tax: data.total_tax,
      total_amount: data.total_amount,
      status: data.status,
      notes: data.notes,
      items:
        data.items?.map((item) => ({
          product_id: String(item.product_id),
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount: item.discount,
          tax_rate: item.tax_rate,
          notes: item.notes,
        })) || [],
    };
  }

  const isLoadingAny = loadingPurchaseOrder || !purchaseOrder;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

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
        onCancel={() => router(ROUTE)}
      />
    </FormWrapper>
  );
}
