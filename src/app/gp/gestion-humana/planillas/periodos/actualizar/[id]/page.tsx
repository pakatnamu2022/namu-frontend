"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  findPayrollPeriodById,
  updatePayrollPeriod,
} from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.actions";
import { PayrollPeriodSchema } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.schema";
import { PayrollPeriodResource } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.interface";
import { PayrollPeriodForm } from "@/features/gp/gestionhumana/planillas/periodo-planilla/components/PayrollPeriodForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAYROLL_PERIOD } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.constant";

export default function UpdatePayrollPeriodPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = PAYROLL_PERIOD;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: payrollPeriod, isLoading: loadingPayrollPeriod } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPayrollPeriodById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PayrollPeriodSchema) =>
      updatePayrollPeriod(id as string, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "update")
      );
    },
  });

  const handleSubmit = (data: PayrollPeriodSchema) => {
    mutate(data);
  };

  function mapPayrollPeriodToForm(
    data: PayrollPeriodResource
  ): Partial<PayrollPeriodSchema> {
    return {
      year: data.year,
      month: data.month,
      payment_date: data.payment_date ?? "",
      company_id: data.company?.id,
    };
  }

  const isLoadingAny = loadingPayrollPeriod || !payrollPeriod;

  if (isLoadingAny) {
    return <div className="p-4 text-muted">Cargando periodo...</div>;
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
      <PayrollPeriodForm
        defaultValues={mapPayrollPeriodToForm(payrollPeriod)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
