"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { ASSIGNMENT_LEADERSHIP } from "@/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.constants";
import { useMutation } from "@tanstack/react-query";
import {
  currentYear,
  ERROR_MESSAGE,
  errorToast,
  currentMonth,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { AssignCompanyBranchSchema } from "@/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.schema";
import { AssignCompanyBranchForm } from "@/features/ap/configuraciones/ventas/asignar-sede/components/AssignCompanyBranchForm";
import { storeAssignCompanyBranch } from "@/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.actions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddAssignCompanyBranchPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = ASSIGNMENT_LEADERSHIP;

  const { mutate, isPending } = useMutation({
    mutationFn: storeAssignCompanyBranch,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
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
