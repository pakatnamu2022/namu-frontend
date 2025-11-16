"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { PRODUCT } from "@/src/features/ap/post-venta/gestion-productos/productos/lib/product.constants";
import { storeProduct } from "@/src/features/ap/post-venta/gestion-productos/productos/lib/product.actions";
import { ProductSchema } from "@/src/features/ap/post-venta/gestion-productos/productos/lib/product.schema";
import { ProductForm } from "@/src/features/ap/post-venta/gestion-productos/productos/components/ProductForm";

export default function CreateProductPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = PRODUCT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeProduct,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
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
          current_stock: 0,
          minimum_stock: 0,
          maximum_stock: 0,
          cost_price: 0,
          sale_price: 0,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router.push("./")}
      />
    </FormWrapper>
  );
}
