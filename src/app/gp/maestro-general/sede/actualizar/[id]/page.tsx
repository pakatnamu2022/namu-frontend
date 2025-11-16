"use client";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { SedeForm } from "@/features/gp/maestro-general/sede/components/SedeForm";
import {
  findSedeById,
  updateSede,
} from "@/features/gp/maestro-general/sede/lib/sede.actions";
import { SEDE } from "@/features/gp/maestro-general/sede/lib/sede.constants";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { SedeSchema } from "@/features/gp/maestro-general/sede/lib/sede.schema";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import NotFound from '@/app/not-found';


export default function EditSedePage() {
    const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL } = SEDE;

  const { data: Sede, isLoading: loadingSede } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findSedeById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SedeSchema) => updateSede(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router("../");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: SedeSchema) => {
    mutate(data);
  };

  function mapSedeToForm(data: SedeResource): Partial<SedeSchema> {
    return {
      suc_abrev: data.suc_abrev,
      abreviatura: data.abreviatura,
      direccion: data.direccion || "",
      dyn_code: data.dyn_code || "",
      establishment: data.establishment || "",
      empresa_id: String(data.empresa_id),
      department_id: String(data.department_id),
      province_id: String(data.province_id),
      district_id: String(data.district_id),
    };
  }

  const isLoadingAny = loadingSede || !Sede;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <SedeForm
        defaultValues={mapSedeToForm(Sede)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
