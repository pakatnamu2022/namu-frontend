"use client";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { SedeForm } from "@/src/features/gp/maestro-general/sede/components/SedeForm";
import {
  findSedeById,
  updateSede,
} from "@/src/features/gp/maestro-general/sede/lib/sede.actions";
import { SEDE } from "@/src/features/gp/maestro-general/sede/lib/sede.constants";
import { SedeResource } from "@/src/features/gp/maestro-general/sede/lib/sede.interface";
import { SedeSchema } from "@/src/features/gp/maestro-general/sede/lib/sede.schema";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notFound, useParams, useRouter } from "next/navigation";

export default function EditSedePage() {
  const { id } = useParams();
  const router = useRouter();
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
      router.push("../");
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
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

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
