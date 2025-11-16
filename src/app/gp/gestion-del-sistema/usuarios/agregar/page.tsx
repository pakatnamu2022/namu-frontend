"use client";

import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { errorToast, successToast } from "@/core/core.function";
import { storeView } from "@/features/gp/gestionsistema/vistas/lib/view.actions";
import { ViewSchema } from "@/features/gp/gestionsistema/vistas/lib/view.schema";
import { ViewForm } from "@/features/gp/gestionsistema/vistas/components/ViewForm";
import { useAllViews } from "@/features/gp/gestionsistema/vistas/lib/view.hook";
import { useAllCompanies } from "@/features/gp/gestionsistema/empresa/lib/company.hook";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from "@/app/not-found";


export default function CreateViewPage() {
  const router = useNavigate();
  
  const { data: views, isLoading: loadingViews } = useAllViews();
  const { data: companies, isLoading: loadingCompanies } = useAllCompanies();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeView,
    onSuccess: () => {
      successToast("Usuario creado exitosamente");
      router("./");
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
  if (!currentView) return <NotFound />;

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
