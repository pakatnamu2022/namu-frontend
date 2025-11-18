"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { errorToast, successToast } from "@/core/core.function";
import {
  findViewById,
  updateView,
} from "@/features/gp/gestionsistema/vistas/lib/view.actions";
import { ViewSchema } from "@/features/gp/gestionsistema/vistas/lib/view.schema";
import { ViewResource } from "@/features/gp/gestionsistema/vistas/lib/view.interface";
import { ViewForm } from "@/features/gp/gestionsistema/vistas/components/ViewForm";
import { useAllViews } from "@/features/gp/gestionsistema/vistas/lib/view.hook";
import { useAllCompanies } from "@/features/gp/gestionsistema/empresa/lib/company.hook";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { VIEW } from "@/features/gp/gestionsistema/vistas/lib/view.constants";

export default function UpdateViewPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();

  const { data: views, isLoading: loadingViews } = useAllViews();
  const { data: companies, isLoading: loadingCompanies } = useAllCompanies();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = VIEW;

  const { data: view, isLoading: loadingView } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findViewById(id as string),
    refetchOnWindowFocus: false,
  });

  const { data: sedes, isLoading: loadingSedes } = useAllSedes();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ViewSchema) => updateView(Number(id as string), data),
    onSuccess: async () => {
      successToast("Vista actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: () => {
      errorToast("No se pudo actualizar la vista");
    },
  });

  const handleSubmit = (data: ViewSchema) => {
    mutate({
      ...data,
      parent_id: data.parent_id ? data.parent_id.toString() : "",
      idPadre: data.idPadre ? data.idPadre.toString() : "",
      idSubPadre: data.idSubPadre ? data.idSubPadre.toString() : "",
      idHijo: data.idHijo ? data.idHijo.toString() : "",
      company_id: data.company_id ? data.company_id.toString() : "",
    } as any);
  };

  function mapViewToForm(data: ViewResource): Partial<ViewSchema> {
    return {
      descripcion: data.descripcion,
      submodule: data.submodule,
      route: data.route ?? "",
      ruta: data.ruta ?? "",
      icono: data.icono ?? "",
      icon: data.icon ?? "",
      parent_id: data.parent_id ? data.parent_id.toString() : "",
      company_id: data.company_id ? data.company_id.toString() : "",
      idPadre: data.idPadre ? data.idPadre.toString() : "",
      idSubPadre: data.idSubPadre ? data.idSubPadre.toString() : "",
      idHijo: data.idHijo ? data.idHijo.toString() : "",
    };
  }

  const isLoadingAny =
    loadingView ||
    !view ||
    loadingSedes ||
    !sedes ||
    loadingViews ||
    loadingCompanies;

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
      <ViewForm
        defaultValues={mapViewToForm(view)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        views={views ?? []}
        companies={companies ?? []}
      />
    </FormWrapper>
  );
}
