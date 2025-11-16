"use client";

import { notFound, useRouter } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { ASSIGNMENT_LEADERSHIP } from "@/src/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.constants";
import { useMutation } from "@tanstack/react-query";
import {
  currentYear,
  ERROR_MESSAGE,
  errorToast,
  currentMonth,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import FormWrapper from "@/src/shared/components/FormWrapper";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { AssignCompanyBranchSchema } from "@/src/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.schema";
import { AssignCompanyBranchForm } from "@/src/features/ap/configuraciones/ventas/asignar-sede/components/AssignCompanyBranchForm";
import { storeAssignCompanyBranch } from "@/src/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.actions";

export default function CreateAssignCompanyBranchPage() {
  const router = useRouter();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = ASSIGNMENT_LEADERSHIP;

  const { mutate, isPending } = useMutation({
    mutationFn: storeAssignCompanyBranch,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router.push("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: AssignCompanyBranchSchema) => {
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
      <AssignCompanyBranchForm
        defaultValues={{
          year: currentYear(),
          month: currentMonth(),
          sede_id: "",
          assigned_workers: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
