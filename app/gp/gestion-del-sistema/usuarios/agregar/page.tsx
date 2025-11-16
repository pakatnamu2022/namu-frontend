"use client";

import { notFound, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/src/core/core.function";
import { storeView } from "@/src/features/gp/gestionsistema/vistas/lib/view.actions";
import { ViewSchema } from "@/src/features/gp/gestionsistema/vistas/lib/view.schema";
import { ViewForm } from "@/src/features/gp/gestionsistema/vistas/components/ViewForm";
import { useAllViews } from "@/src/features/gp/gestionsistema/vistas/lib/view.hook";
import { useAllCompanies } from "@/src/features/gp/gestionsistema/empresa/lib/company.hook";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function CreateViewPage() {
  const router = useRouter();

  const { data: views, isLoading: loadingViews } = useAllViews();
  const { data: companies, isLoading: loadingCompanies } = useAllCompanies();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeView,
    onSuccess: () => {
      successToast("Usuario creado exitosamente");
      router.push("./");
    },
    onError: () => {
      errorToast("Hubo un error al crear el equipo");
    },
  });

  const handleSubmit = (data: ViewSchema) => {
    mutate({
      ...data,
    });
  };

  if (loadingViews || loadingCompanies) {
    return <div className="p-4 text-muted">Cargando Vistas</div>;
  }
  if (!checkRouteExists("vistas")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <ViewForm
        defaultValues={{
          descripcion: "",
          submodule: false,
          route: "",
          ruta: "",
          icono: "",
          icon: "",
          parent_id: "",
          company_id: "",
          idPadre: "",
          idSubPadre: "",
          idHijo: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        views={views ?? []}
        companies={companies ?? []}
      />
    </FormWrapper>
  );
}
