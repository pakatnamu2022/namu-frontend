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
import { PRODUCT } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.constants";
import {
  findProductById,
  updateProduct,
} from "@/features/ap/post-venta/gestion-productos/productos/lib/product.actions";
import { ProductSchema } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.schema";
import { ProductResource } from "@/features/ap/post-venta/gestion-productos/productos/lib/product.interface";
import { ProductForm } from "@/features/ap/post-venta/gestion-productos/productos/components/ProductForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateProductPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = PRODUCT;

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProductById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductSchema) => updateProduct(Number(id), data),
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

  const handleSubmit = (data: ProductSchema) => {
    mutate(data);
  };

  function mapProductToForm(data: ProductResource): Partial<ProductSchema> {
    return {
      code: data.code,
      dyn_code: data.dyn_code,
      name: data.name,
      description: data.description,
      product_category_id: String(data.product_category_id),
      brand_id: String(data.brand_id),
      ap_class_article_id: String(data.ap_class_article_id),
      unit_measurement_id: String(data.unit_measurement_id),
      cost_price: Number(data.cost_price),
      sale_price: Number(data.sale_price),
      warranty_months: Number(data.warranty_months),
    };
  }

  const isLoadingAny = loadingProduct || !product;

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
      <ProductForm
        defaultValues={mapProductToForm(product)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
