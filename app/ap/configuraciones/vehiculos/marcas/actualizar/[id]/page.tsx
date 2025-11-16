"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { findBrandsById } from "@/src/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";
import { BrandsSchema } from "@/src/features/ap/configuraciones/vehiculos/marcas/lib/brands.schema";
import { updateBrands } from "@/src/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { BrandsResource } from "@/src/features/ap/configuraciones/vehiculos/marcas/lib/brands.interface";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { BrandsForm } from "@/src/features/ap/configuraciones/vehiculos/marcas/components/BrandsForm";
import { BRAND } from "@/src/features/ap/configuraciones/vehiculos/marcas/lib/brands.constants";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function EditBrandPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ROUTE, MODEL, QUERY_KEY } = BRAND;
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
      router.push("../");
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
      is_commercial: true,
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
