"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeAttendanceRule } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.actions";
import { AttendanceRuleForm } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/components/AttendanceRuleForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { AttendanceRuleSchema } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { ATTENDANCE_RULE } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.constant";

export default function AddAttendanceRulePage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = ATTENDANCE_RULE;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storeAttendanceRule,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  const handleSubmit = (data: AttendanceRuleSchema) => {
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
      <AttendanceRuleForm
        defaultValues={{
          code: "",
          hour_type: "DIURNO",
          hours: null,
          multiplier: 1,
          pay: false,
          use_shift: false,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
