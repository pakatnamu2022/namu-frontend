"use client";

import { notFound, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { HierarchicalCategorySchema } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.schema";
import { HierarchicalCategoryForm } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/components/HierarchicalCategoryForm";
import { storeHierarchicalCategory } from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categorias-jerarquicas/lib/hierarchicalCategory.actions";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function CreateHierarchicalCategoryPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeHierarchicalCategory,
    onSuccess: () => {
      successToast("Categoría Jerárquica creada exitosamente");
      router.push("./");
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
