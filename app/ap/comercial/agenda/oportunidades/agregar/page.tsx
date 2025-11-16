"use client";

import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OpportunityForm } from "@/features/ap/comercial/oportunidades/components/OpportunityForm";
import { OpportunityActionForm } from "@/features/ap/comercial/oportunidades/components/OpportunityActionForm";
import {
  useCreateOpportunity,
  useCreateOpportunityAction,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import FormWrapper from "@/shared/components/FormWrapper";
import { OPPORTUNITIES } from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { useCustomerValidated } from "@/features/ap/comercial/clientes/lib/customers.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ERROR_MESSAGE, errorToast } from "@/core/core.function";
import { AxiosError } from "axios";
import { MessageResponse } from "@/core/core.interface";
import OpportunityClientCard from "@/features/ap/comercial/oportunidades/components/OpportunityClientCard";
import { LeadInfoCard } from "@/features/ap/comercial/oportunidades/components/LeadInfoCard";
import { useManageLead } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.hook";

const { ABSOLUTE_ROUTE } = OPPORTUNITIES;

export default function AddOpportunityPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdFromQuery = searchParams.get("client_id");
  const leadIdFromQuery = searchParams.get("lead_id");

  const [step, setStep] = useState<"opportunity" | "action">("opportunity");
  const [createdOpportunityId, setCreatedOpportunityId] = useState<
    number | null
  >(null);

  const createOpportunityMutation = useCreateOpportunity();
  const createActionMutation = useCreateOpportunityAction();
  const { data, isLoading, error } = useCustomerValidated(
    clientIdFromQuery ? Number(clientIdFromQuery) : 0
  );
  const { data: leadData, isLoading: isLoadingLead } = useManageLead(
    leadIdFromQuery ? Number(leadIdFromQuery) : 0
  );

  // Redirigir si no hay client_id
  useEffect(() => {
    if (!clientIdFromQuery || !leadIdFromQuery) {
      router(`${ABSOLUTE_ROUTE}`);
    }
  }, [clientIdFromQuery, leadIdFromQuery, router]);

  // Manejar errores de validación
  useEffect(() => {
    if (error) {
      const axiosError = error as AxiosError<MessageResponse>;
      const errorMessage =
        axiosError?.response?.data?.message || "Error desconocido";

      errorToast(ERROR_MESSAGE(OPPORTUNITIES.MODEL, "fetch", errorMessage));
      router(`${ABSOLUTE_ROUTE}`);
    }
  }, [error, router]);

  const handleOpportunitySubmit = (data: any) => {
    const dataWithLead = {
      ...data,
      lead_id: Number(leadIdFromQuery),
    };
    createOpportunityMutation.mutate(
      { ...dataWithLead },
      {
        onSuccess: (response) => {
          setCreatedOpportunityId(response.id);
          setStep("action");
        },
        onError: (error: any) => {
          errorToast(
            ERROR_MESSAGE(
              OPPORTUNITIES.MODEL,
              "create",
              error.response.data.message
            )
          );
        },
      }
    );
  };

  const handleActionSubmit = (data: any) => {
    if (!createdOpportunityId) return;

    createActionMutation.mutate(
      { ...data, opportunity_id: createdOpportunityId },
      {
        onSuccess: () => {
          router(`${ABSOLUTE_ROUTE}/${createdOpportunityId}`);
        },
      }
    );
  };

  const handleSkipAction = () => {
    if (createdOpportunityId) {
      router(`${ABSOLUTE_ROUTE}/${createdOpportunityId}`);
    }
  };

  if (isLoading || isLoadingLead) return <FormSkeleton />;

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <TitleComponent
          title={
            step === "opportunity"
              ? "Nueva Oportunidad"
              : "Registrar Primera Acción"
          }
          subtitle={
            step === "opportunity"
              ? "Registra una nueva oportunidad de venta"
              : "Registra el primer contacto con el cliente"
          }
          icon="Target"
        />
      </HeaderTableWrapper>

      {step === "opportunity" && (data || leadData) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data && <OpportunityClientCard data={data} />}
          {leadData && <LeadInfoCard lead={leadData} />}
        </div>
      )}

      {step === "opportunity" ? (
        <OpportunityForm
          defaultValues={{
            client_id: clientIdFromQuery!,
            family_id: "",
            opportunity_type_id: "",
            client_status_id: "",
            opportunity_status_id: "",
          }}
          onSubmit={handleOpportunitySubmit}
          isSubmitting={createOpportunityMutation.isPending}
          mode="create"
          clientId={clientIdFromQuery ? Number(clientIdFromQuery) : undefined}
          showClientSelector={!clientIdFromQuery}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Registra el primer contacto (Opcional)
              </h3>
              <Button variant="ghost" onClick={handleSkipAction}>
                Omitir y Finalizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <OpportunityActionForm
              defaultValues={{
                opportunity_id: createdOpportunityId?.toString(),
                action_type_id: "",
                action_contact_type_id: "",
                description: "",
                result: false,
              }}
              onSubmit={handleActionSubmit}
              isSubmitting={createActionMutation.isPending}
              opportunityId={createdOpportunityId || undefined}
              mode="create"
            />
          </CardContent>
        </Card>
      )}
    </FormWrapper>
  );
}
