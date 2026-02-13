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
  getSupplierOrderById,
  updateSupplierOrder,
} from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.actions.ts";
import { SupplierOrderSchema } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.schema.ts";
import { SupplierOrderResource } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.interface.ts";
import { SupplierOrderForm } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/components/SupplierOrderForm.tsx";
import { SUPPLIER_ORDER } from "@/features/ap/post-venta/gestion-almacen/compra-proveedor/lib/supplierOrder.constants.ts";

export default function UpdateSupplierOrderPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, QUERY_KEY, ABSOLUTE_ROUTE } = SUPPLIER_ORDER;

  const { data: supplierOrder, isLoading: loadingSupplierOrder } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      return await getSupplierOrderById(Number(id));
    },
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => updateSupplierOrder(Number(id), data),
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

  const handleSubmit = (data: any) => {
    mutate(data);
  };

  function mapSupplierOrderToForm(
    data: SupplierOrderResource
  ): Partial<SupplierOrderSchema> {
    return {
      order_number: data.order_number,
      supplier_id: String(data.supplier_id),
      sede_id: String(data.sede_id),
      warehouse_id: String(data.warehouse_id),
      type_currency_id: String(data.type_currency_id),
      order_date: data.order_date
        ? new Date(data.order_date + "T00:00:00")
        : "",
      supply_type: data.supply_type as "STOCK" | "LIMA" | "IMPORTACION",
      details:
        data.details?.map((item) => ({
          product_id: String(item.product_id),
          unit_measurement_id: String(item.unit_measurement_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          total: Number(item.total),
          note: item.note || "",
        })) || [],
    };
  }

  const isLoadingAny = loadingSupplierOrder || !supplierOrder;

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
      <SupplierOrderForm
        defaultValues={mapSupplierOrderToForm(supplierOrder)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE)}
        SupplierOrderData={supplierOrder}
      />
    </FormWrapper>
  );
}
