"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { DISTRICT } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.constants";
import { DistrictResource } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.interface";
import { DistrictForm } from "@/features/ap/configuraciones/maestros-general/ubigeos/components/DistrictForm";
import { DistrictSchema } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.schema";
import NotFound from "@/app/not-found";
import {
  findDistrictById,
  updateDistrict,
} from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.actions";

export default function EditDistrictPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = DISTRICT;

  const { data: District, isLoading: loadingDistrict } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findDistrictById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: DistrictSchema) => updateDistrict(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: DistrictSchema) => {
    mutate(data);
  };

  function mapDistrictToForm(data: DistrictResource): Partial<DistrictSchema> {
    return {
      name: data.name,
      ubigeo: data.ubigeo,
      province_id: data.province_id.toString(),
      department_id: data.department_id.toString(),
    };
  }

  const isLoadingAny = loadingDistrict || !District;

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
      <DistrictForm
        defaultValues={mapDistrictToForm(District)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
