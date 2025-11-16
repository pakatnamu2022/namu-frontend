"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { OpportunityForm } from "@/features/ap/comercial/oportunidades/components/OpportunityForm";
import {
  useOpportunity,
  useUpdateOpportunity,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import { OPPORTUNITIES } from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import FormWrapper from "@/shared/components/FormWrapper";
import BackButton from "@/shared/components/BackButton";
import EmptyModel from "@/shared/components/EmptyModel";
import { AGENDA } from "@/features/ap/comercial/agenda/lib/agenda.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";
import OpportunityClientCard from "@/features/ap/comercial/oportunidades/components/OpportunityClientCard";

const { ABSOLUTE_ROUTE } = OPPORTUNITIES;
const { ABSOLUTE_ROUTE: AGENDA_ABSOLUTE_ROUTE } = AGENDA;

export default function UpdateOpportunityPage() {
  const params = useParams();
  const router = useNavigate();
  const opportunityId = Number(params.id);

  const { data: opportunity, isLoading } = useOpportunity(opportunityId);
  const updateMutation = useUpdateOpportunity();

  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      { id: opportunityId, data },
      {
        onSuccess: () => {
          router(`${ABSOLUTE_ROUTE}/${opportunityId}`);
        },
      }
    );
  };

  if (isLoading) return <FormSkeleton />;
  if (!opportunity) return <EmptyModel route={`${AGENDA_ABSOLUTE_ROUTE}`} />;

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <div className="flex items-center gap-4">
          <BackButton
            route={`${ABSOLUTE_ROUTE}/${opportunityId}`}
            name=""
            size="icon"
          />
          <TitleComponent
            title={`Oportunidad con ${opportunity.client.full_name}`}
            subtitle={
              opportunity.family.brand + " " + opportunity.family.description
            }
            icon="Target"
          />
        </div>
      </HeaderTableWrapper>

      <OpportunityClientCard data={opportunity.client} />

      <OpportunityForm
        defaultValues={{
          client_id: opportunity.client_id.toString(),
          family_id: opportunity.family_id.toString(),
          opportunity_type_id: opportunity.opportunity_type_id.toString(),
          client_status_id: opportunity.client_status_id.toString(),
          opportunity_status_id: opportunity.opportunity_status_id.toString(),
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        mode="update"
        clientId={opportunity.client_id}
      />
    </FormWrapper>
  );
}
