"use client";

import { useNavigate } from "react-router-dom";
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
import { notFound } from "@/shared/hooks/useNotFound";
import { VIEW } from "@/features/gp/gestionsistema/vistas/lib/view.constants";

export default function AddViewPage() {
  const router = useNavigate();

  const { data: views, isLoading: loadingViews } = useAllViews();
  const { data: companies, isLoading: loadingCompanies } = useAllCompanies();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ABSOLUTE_ROUTE, ROUTE } = VIEW;

  const { mutate, isPending } = useMutation({
    mutationFn: storeView,
    onSuccess: () => {
      successToast("Vista creado exitosamente");
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msj = error?.response?.data?.message || "Error desconocido";
      errorToast(msj);
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
  if (!checkRouteExists(ROUTE)) notFound();
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
