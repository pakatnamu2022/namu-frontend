"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { USER_SERIES_ASSIGNMENT } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.constants";
import { storeUserSeriesAssignment } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.actions";
import { UserSeriesAssignmentSchema } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/lib/userSeriesAssignment.schema";
import { UserSeriesAssignmentForm } from "@/src/features/ap/configuraciones/maestros-general/asignar-serie-usuario/components/UserSeriesAssignmentForm";

export default function CreateUserSeriesAssignmentPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = USER_SERIES_ASSIGNMENT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeUserSeriesAssignment,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: UserSeriesAssignmentSchema) => {
    mutate(data);
  };
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

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
