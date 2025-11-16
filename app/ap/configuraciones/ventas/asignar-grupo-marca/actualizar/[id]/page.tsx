"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { ASSIGNMENT_LEADERSHIP } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.constants";
import {
  findCommercialManagerBrandGroupById,
  updateCommercialManagerBrandGroup,
} from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.actions";
import { CommercialManagerBrandGroupResource } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.interface";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { CommercialManagerBrandGroupForm } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupForm";
import { CommercialManagerBrandGroupSchema } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.schema";

export default function EditCommercialManagerBrandGroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { QUERY_KEY, ROUTE, MODEL } = ASSIGNMENT_LEADERSHIP;

  const {
    data: CommercialManagerBrandGroup,
    isLoading: loadingCommercialManagerBrandGroup,
  } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCommercialManagerBrandGroupById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CommercialManagerBrandGroupResource) =>
      updateCommercialManagerBrandGroup(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router.push("../");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: CommercialManagerBrandGroupResource) => {
    mutate(data);
  };

  function mapCommercialManagerBrandGroupToForm(
    data: CommercialManagerBrandGroupResource
  ): Partial<CommercialManagerBrandGroupSchema> {
    return {
      brand_group_id: data.brand_group_id.toString(),
      commercial_managers: data.commercial_managers.map(
        (commercial_manager) => ({
          id: commercial_manager.id,
          name: commercial_manager.name,
        })
      ),
    };
  }

  const isLoadingAny =
    loadingCommercialManagerBrandGroup || !CommercialManagerBrandGroup;

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
      <CommercialManagerBrandGroupForm
        defaultValues={mapCommercialManagerBrandGroupToForm(
          CommercialManagerBrandGroup
        )}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
