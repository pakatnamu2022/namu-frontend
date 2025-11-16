"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAllSedes } from "@/src/features/gp/maestro-general/sede/lib/sede.hook";
import { errorToast, successToast } from "@/src/core/core.function";
import {
  findViewById,
  updateView,
} from "@/src/features/gp/gestionsistema/vistas/lib/view.actions";
import { ViewSchema } from "@/src/features/gp/gestionsistema/vistas/lib/view.schema";
import { ViewResource } from "@/src/features/gp/gestionsistema/vistas/lib/view.interface";
import { ViewForm } from "@/src/features/gp/gestionsistema/vistas/components/ViewForm";
import { useAllViews } from "@/src/features/gp/gestionsistema/vistas/lib/view.hook";
import { useAllCompanies } from "@/src/features/gp/gestionsistema/empresa/lib/company.hook";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";

export default function EditViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: views, isLoading: loadingViews } = useAllViews();
  const { data: companies, isLoading: loadingCompanies } = useAllCompanies();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: view, isLoading: loadingView } = useQuery({
    queryKey: ["view", id],
    queryFn: () => findViewById(id as string),
    refetchOnWindowFocus: false,
  });

  const { data: sedes, isLoading: loadingSedes } = useAllSedes();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ViewSchema) => updateView(Number(id as string), data),
    onSuccess: async () => {
      successToast("Vista actualizada correctamente");
      await queryClient.invalidateQueries({
        queryKey: ["view", id],
      });
      router.push("../");
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
  if (!checkRouteExists("vistas")) notFound();
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
