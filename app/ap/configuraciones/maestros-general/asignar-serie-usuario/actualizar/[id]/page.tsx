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
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import {
  findUserSeriesAssignmentById,
  updateUserSeriesAssignment,
} from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.actions";
import { UserSeriesAssignmentResource } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.interface";
import { UserSeriesAssignmentSchema } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.schema";
import { UserSeriesAssignmentForm } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentForm";
import { USER_SERIES_ASSIGNMENT } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.constants";

export default function EditUserSeriesAssignmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { QUERY_KEY, ROUTE, MODEL } = USER_SERIES_ASSIGNMENT;

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
      router.push("../");
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
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

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
