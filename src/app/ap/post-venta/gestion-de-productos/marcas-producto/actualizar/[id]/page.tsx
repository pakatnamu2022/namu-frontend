"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { findBrandsById } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";
import { BrandsSchema } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.schema";
import { updateBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { BrandsResource } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.interface";
import FormSkeleton from "@/shared/components/FormSkeleton";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { BrandsForm } from "@/features/ap/configuraciones/vehiculos/marcas/components/BrandsForm";
import FormWrapper from "@/shared/components/FormWrapper";
import { BRAND_POSTVENTA } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { CM_POSTVENTA_ID } from "@/core/core.constants";

export default function UpdateBrandsPVPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { ROUTE, MODEL, QUERY_KEY, ABSOLUTE_ROUTE } = BRAND_POSTVENTA;
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: Brand, isLoading: loadingBrand } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBrandsById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BrandsSchema) => updateBrands(Number(id), data),
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

  const handleSubmit = (data: BrandsSchema) => {
    mutate(data);
  };

  function mapBrandToForm(data: BrandsResource): Partial<BrandsSchema> {
    return {
      code: data.code,
      dyn_code: data.dyn_code,
      name: data.name,
      description: data.description,
      group_id: data.group_id.toString(),
      type_operation_id: String(CM_POSTVENTA_ID),
    };
  }

  const isLoadingAny = loadingBrand || !Brand;

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
      <BrandsForm
        defaultValues={mapBrandToForm(Brand)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
