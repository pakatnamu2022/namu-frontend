"use client";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CompanyForm } from "@/features/gp/maestro-general/empresa/components/CompanyForm";
import {
  findCompanyById,
  updateCompany,
} from "@/features/gp/maestro-general/empresa/lib/company.actions";
import { COMPANY } from "@/features/gp/maestro-general/empresa/lib/company.constants";
import { CompanyResource } from "@/features/gp/maestro-general/empresa/lib/company.interface";
import { CompanySchema } from "@/features/gp/maestro-general/empresa/lib/company.schema";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateCompanyPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = COMPANY;

  const { data: company, isLoading: loadingCompany } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCompanyById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CompanySchema) => updateCompany(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: CompanySchema) => {
    mutate(data);
  };

  function mapCompanyToForm(data: CompanyResource): Partial<CompanySchema> {
    return {
      name: data.name,
      abbreviation: data.abbreviation,
      businessName: data.businessName,
      description: data.description || "",
      email: data.email || "",
      phone: data.phone || "",
      address: data.address || "",
      city: data.city || "",
      website: data.website || "",
      detraction_amount: data.detraction_amount,
      billing_detraction_type_id: String(data.billing_detraction_type_id),
    };
  }

  if (loadingCompany || !company) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <CompanyForm
        defaultValues={mapCompanyToForm(company)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
