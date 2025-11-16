"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import {
  findHierarchicalCategoryById,
  updateHierarchicalCategory,
} from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.actions";
import { HierarchicalCategorySchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.schema";
import { HierarchicalCategoryResource } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.interface";
import { HierarchicalCategoryForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryForm";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function EditHierarchicalCategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: period, isLoading: loadingHierarchicalCategory } = useQuery({
    queryKey: ["hierarchicalCategory", id],
    queryFn: () => findHierarchicalCategoryById(Number(id as string)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: HierarchicalCategorySchema) =>
      updateHierarchicalCategory(id as string, data),
    onSuccess: async () => {
      successToast("Categoría Jerárquica actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["hierarchicalCategory", id],
      });
      router.push("../");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ||
          "No se pudo actualizar la categoría jerárquica"
      );
    },
  });

  const handleSubmit = (data: HierarchicalCategorySchema) => {
    mutate({
      ...data,
    } as any);
  };

  function mapHierarchicalCategoryToForm(
    data: HierarchicalCategoryResource
  ): Partial<HierarchicalCategorySchema> {
    return {
      name: data.name,
      description: data.description ?? "",
      excluded_from_evaluation: data.excluded_from_evaluation ?? false,
      hasObjectives: data.hasObjectives ?? false,
    };
  }

  const isLoadingAny = loadingHierarchicalCategory || !period;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists("categorias-jerarquicas")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <HierarchicalCategoryForm
        defaultValues={mapHierarchicalCategoryToForm(period)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
