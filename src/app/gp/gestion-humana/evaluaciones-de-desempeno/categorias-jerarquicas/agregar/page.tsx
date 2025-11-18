"use client";

import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { HierarchicalCategorySchema } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.schema";
import { HierarchicalCategoryForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryForm";
import { storeHierarchicalCategory } from "@/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.actions";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";


export default function AddHierarchicalCategoryPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeHierarchicalCategory,
    onSuccess: () => {
      successToast("Categoría Jerárquica creada exitosamente");
      router("./");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message ??
          "Hubo un error al crear la categoría jerárquica"
      );
    },
  });

  const handleSubmit = (data: HierarchicalCategorySchema) => {
    mutate(data);
  };
  if (!checkRouteExists("categorias-jerarquicas")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <HierarchicalCategoryForm
        defaultValues={{
          name: "",
          description: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
