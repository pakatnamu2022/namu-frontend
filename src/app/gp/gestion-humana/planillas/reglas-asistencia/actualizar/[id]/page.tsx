"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { updateAttendanceRule } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.actions";
import { AttendanceRuleSchema } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.schema";
import { AttendanceRuleResource } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.interface";
import { AttendanceRuleForm } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/components/AttendanceRuleForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { ATTENDANCE_RULE } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.constant";
import { useAttendanceRuleById } from "@/features/gp/gestionhumana/planillas/reglas-asistencia/lib/attendance-rule.hook";

export default function UpdateAttendanceRulePage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = ATTENDANCE_RULE;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: attendanceRule, isLoading: loadingRule } =
    useAttendanceRuleById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AttendanceRuleSchema) =>
      updateAttendanceRule(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "update"),
      );
    },
  });

  const handleSubmit = (data: AttendanceRuleSchema) => {
    mutate(data);
  };

  function mapToForm(
    data: AttendanceRuleResource,
  ): Partial<AttendanceRuleSchema> {
    return {
      code: data.code,
      hour_type: data.hour_type,
      hours: data.hours,
      multiplier: data.multiplier,
      pay: Boolean(data.pay),
      use_shift: Boolean(data.use_shift),
    };
  }

  const isLoadingAny = loadingRule || !attendanceRule;

  if (isLoadingAny) {
    return (
      <div className="p-4 text-muted">Cargando regla de asistencia...</div>
    );
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
      <AttendanceRuleForm
        defaultValues={mapToForm(attendanceRule)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
