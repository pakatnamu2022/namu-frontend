"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  findPayrollConceptById,
  updatePayrollConcept,
} from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.actions";
import { PayrollConceptSchema } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.schema";
import { PayrollConceptResource } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.interface";
import { PayrollConceptForm } from "@/features/gp/gestionhumana/planillas/conceptos/components/PayrollConceptForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAYROLL_CONCEPT } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.constant";

export default function UpdatePayrollConceptPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY } = PAYROLL_CONCEPT;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: concept, isLoading: loadingConcept } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPayrollConceptById(id as string),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PayrollConceptSchema) =>
      updatePayrollConcept(id as string, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      errorToast(err?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "update"));
    },
  });

  const handleSubmit = (data: PayrollConceptSchema) => {
    mutate(data);
  };

  function mapConceptToForm(
    data: PayrollConceptResource
  ): Partial<PayrollConceptSchema> {
    return {
      code: data.code,
      name: data.name,
      description: data.description || "",
      type: data.type,
      category: data.category,
      formula: data.formula || "",
      formula_description: data.formula_description || "",
      is_taxable: data.is_taxable,
      calculation_order: data.calculation_order,
      active: data.active,
    };
  }

  const isLoadingAny = loadingConcept || !concept;

  if (isLoadingAny) {
    return <div className="p-4 text-muted-foreground">Cargando concepto...</div>;
  }
  if (!checkRouteExists("conceptos")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <PayrollConceptForm
        defaultValues={mapConceptToForm(concept)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
