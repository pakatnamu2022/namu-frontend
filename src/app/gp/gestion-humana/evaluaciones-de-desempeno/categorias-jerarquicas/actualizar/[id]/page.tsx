"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import {
  findHierarchicalCategoryById,
  updateHierarchicalCategory,
} from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.actions";
import { HierarchicalCategorySchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.schema";
import { HierarchicalCategoryResource } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.interface";
import { HierarchicalCategoryForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { HIERARCHICAL_CATEGORY } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.constants";

export default function UpdateHierarchicalCategoryPage() {
  const { ABSOLUTE_ROUTE } = HIERARCHICAL_CATEGORY;
  const { id } = useParams();
  const router = useNavigate();
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
      router(ABSOLUTE_ROUTE);
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
