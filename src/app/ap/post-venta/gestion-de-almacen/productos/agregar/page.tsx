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
import { PRODUCT } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.constants.ts";
import { storeProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.actions.ts";
import { ProductSchema } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.schema.ts";
import { ProductForm } from "@/features/ap/post-venta/gestion-almacen/productos/components/ProductForm.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";

export default function AddProductPVPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PRODUCT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeProduct,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ProductSchema) => {
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
      <ProductForm
        defaultValues={{
          code: "",
          name: "",
          description: "",
          brand_id: "",
          product_category_id: "",
          unit_measurement_id: "",
          cost_price: 0,
          sale_price: 0,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
