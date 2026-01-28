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
import { storeSupplierOrder } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.actions.ts";
import { SupplierOrderForm } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/components/SupplierOrderForm.tsx";
import { SUPPLIER_ORDER } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.constants.ts";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";

export default function AddSupplierOrderPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = SUPPLIER_ORDER;

  const { mutate, isPending } = useMutation({
    mutationFn: storeSupplierOrder,
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
      <SupplierOrderForm
        defaultValues={{
          supplier_id: "",
          sede_id: "",
          warehouse_id: "",
          type_currency_id: CURRENCY_TYPE_IDS.DOLLARS,
          order_date: new Date().toISOString().split("T")[0] || "",
          supply_type: "LIMA",
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
