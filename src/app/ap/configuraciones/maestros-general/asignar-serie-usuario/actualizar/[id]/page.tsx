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
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import {
  findUserSeriesAssignmentById,
  updateUserSeriesAssignment,
} from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.actions";
import { UserSeriesAssignmentResource } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.interface";
import { UserSeriesAssignmentSchema } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.schema";
import { UserSeriesAssignmentForm } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentForm";
import { USER_SERIES_ASSIGNMENT } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.constants";
import NotFound from "@/app/not-found";

export default function UpdateUserSeriesAssignmentPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { QUERY_KEY, ROUTE, MODEL, ABSOLUTE_ROUTE } = USER_SERIES_ASSIGNMENT;

  const { data: UserSeriesAssignment, isLoading: loadingUserSeriesAssignment } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => findUserSeriesAssignmentById(Number(id)),
      refetchOnWindowFocus: false,
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: UserSeriesAssignmentResource) =>
      updateUserSeriesAssignment(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: UserSeriesAssignmentResource) => {
    mutate(data);
  };

  function mapUserSeriesAssignmentToForm(
    data: UserSeriesAssignmentResource
  ): Partial<UserSeriesAssignmentSchema> {
    return {
      worker_id: data.worker_id.toString(),
      vouchers: data.vouchers,
    };
  }

  const isLoadingAny = loadingUserSeriesAssignment || !UserSeriesAssignment;

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
      <UserSeriesAssignmentForm
        defaultValues={mapUserSeriesAssignmentToForm(UserSeriesAssignment)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
