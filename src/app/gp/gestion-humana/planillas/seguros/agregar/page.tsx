"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  importInsurance,
  createInsurance,
} from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.actions";
import { InsuranceForm } from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceForm";
import { InsuranceManualForm } from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceManualForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { InsuranceSchema, InsuranceManualSchema } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { INSURANCE } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AddInsurancePage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = INSURANCE;
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("companyId") ?? undefined;
  const companyName = searchParams.get("companyName") ?? undefined;
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate: mutateImport, isPending: isImporting } = useMutation({
    mutationFn: ({ data, file }: { data: InsuranceSchema; file: File }) =>
      importInsurance(file, data.period_id, data.business_partner_id),
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

  const { mutate: mutateManual, isPending: isSavingManual } = useMutation({
    mutationFn: (data: InsuranceManualSchema) =>
      createInsurance({
        ...data,
        worker_id: Number(data.worker_id),
        period_id: Number(data.period_id),
        business_partner_id: Number(data.business_partner_id),
        doc_number_affiliate: data.doc_number_affiliate || null,
        contracting_name: data.contracting_name || null,
        num_doc_contracting: data.num_doc_contracting || null,
        rate_with_tax: data.rate_with_tax || 0,
      }),
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

  const handleImportSubmit = (data: InsuranceSchema, file: File) => {
    mutateImport({ data, file });
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

      <Tabs defaultValue="import" className="w-full">
        <TabsList>
          <TabsTrigger value="import">Importar Excel</TabsTrigger>
          <TabsTrigger value="manual">Registrar uno a uno</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="pt-4">
          <InsuranceForm
            onSubmit={handleImportSubmit}
            isSubmitting={isImporting}
            companyId={companyId}
            companyName={companyName}
          />
        </TabsContent>

        <TabsContent value="manual" className="pt-4">
          <InsuranceManualForm
            defaultValues={{}}
            onSubmit={mutateManual}
            isSubmitting={isSavingManual}
            companyId={companyId}
          />
        </TabsContent>
      </Tabs>
    </FormWrapper>
  );
}
