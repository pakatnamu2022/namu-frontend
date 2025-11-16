"use client";

import { useNavigate } from 'react-router-dom';
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
import { AssignmentLeadershipSchema } from "@/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { AssignmentLeadershipForm } from "@/features/ap/configuraciones/ventas/asignar-jefe/components/AssignmentLeadershipForm";
import { storeAssignmentLeadership } from "@/features/ap/configuraciones/ventas/asignar-jefe/lib/assignmentLeadership.actions";
import NotFound from '@/app/not-found';


export default function CreateAssignmentLeadershipPage() {
  const router = useNavigate();
  
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = ASSIGNMENT_LEADERSHIP;

  const { mutate, isPending } = useMutation({
    mutationFn: storeAssignmentLeadership,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: AssignmentLeadershipSchema) => {
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
      <AssignmentLeadershipForm
        defaultValues={{
          year: currentYear(),
          month: currentMonth(),
          boss_id: "",
          assigned_workers: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
