"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PURCHASE_INVOICE_PV } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.constants";
import {
  findVehiclePurchaseOrderById,
  resendPostventa,
} from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.actions";
import { VehiclePurchaseOrderResource } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.interface";
import { PurchaseOrderProductsSchema } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.schema";
import { PurchaseOrderProductsForm } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/components/PurchaseOrderProductsForm";

export default function ResendWarehousePurchaseOrderPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, QUERY_KEY, ABSOLUTE_ROUTE } = PURCHASE_INVOICE_PV;

  const { data: purchaseOrder, isLoading } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehiclePurchaseOrderById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => resendPostventa(Number(id), data),
    onSuccess: async () => {
      successToast("Factura de compra actualizada exitosamente");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  function mapToForm(
    data: VehiclePurchaseOrderResource,
  ): Partial<PurchaseOrderProductsSchema> {
    return {
      invoice_series: data.invoice_series || "",
      invoice_number: data.invoice_number || "",
      supplier_id: data.supplier_id ? String(data.supplier_id) : "",
      sede_id: data.sede_id ? String(data.sede_id) : "",
      emission_date: data.emission_date
        ? new Date(data.emission_date + "T00:00:00")
        : undefined,
      due_date: data.due_date
        ? new Date(data.due_date + "T00:00:00")
        : undefined,
      payment_terms: data.payment_terms || undefined,
      warehouse_id: data.warehouse_id ? String(data.warehouse_id) : undefined,
      currency_id: data.currency_id ? String(data.currency_id) : undefined,
      subtotal: Number(data.subtotal) || 0,
      total: Number(data.total) || 0,
      notes: data.notes || undefined,
      status: "PENDING",
      items:
        data.items?.map((item) => ({
          product_id: String(item.product_id),
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          item_total: Number(item.total) || 0,
          unit_measurement_id: undefined,
          product_name: item.product_name || undefined,
          product_code: item.product_code || undefined,
        })) || [],
    };
  }

  if (isLoading || !purchaseOrder) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Reenviar Factura de Compra"
        mode="edit"
        icon={currentView.icon}
      />
      <PurchaseOrderProductsForm
        defaultValues={mapToForm(purchaseOrder)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE)}
        PurchaseOrderProductsData={purchaseOrder as any}
      />
    </FormWrapper>
  );
}
