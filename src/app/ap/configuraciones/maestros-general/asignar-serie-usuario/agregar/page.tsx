"use client";

import { useNavigate } from 'react-router-dom';
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { USER_SERIES_ASSIGNMENT } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.constants";
import { storeUserSeriesAssignment } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.actions";
import { UserSeriesAssignmentSchema } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.schema";
import { UserSeriesAssignmentForm } from "@/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentForm";
import NotFound from "@/app/not-found";


export default function CreateUserSeriesAssignmentPage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = USER_SERIES_ASSIGNMENT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeUserSeriesAssignment,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: UserSeriesAssignmentSchema) => {
    mutate(data);
  };
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <UserSeriesAssignmentForm
        defaultValues={{
          worker_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
